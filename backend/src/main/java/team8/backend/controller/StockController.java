package team8.backend.controller;

import java.net.URI;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;


/**
 * Controller exposing stock-related endpoints backed by third-party APIs
 * (Finnhub and Massive). Endpoints provide search, news, quotes, company
 * profile, metrics, and historical aggregates used by the frontend.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/stock")
public class StockController {

    @Value("${finnhub.api-key}")
    private String FINNHUB_API_KEY;

    @Value("${massive.api-key:}")
    private String MASSIVE_API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();
    private final List<String> finnhubKeys = new ArrayList<>();
    private final AtomicInteger finnhubKeyIndex = new AtomicInteger(0);
    private final List<String> massiveKeys = new ArrayList<>();
    private final AtomicInteger massiveKeyIndex = new AtomicInteger(0);


    // Allow multiple keys separated by ":" to spread requests across keys
    @PostConstruct
    public void initFinnhubKeys() {
        if (FINNHUB_API_KEY == null || FINNHUB_API_KEY.isBlank()) {
            return;
        }
        for (String key : FINNHUB_API_KEY.split(":")) {
            if (key != null && !key.isBlank()) {
                finnhubKeys.add(key.trim());
            }
        }
    }

    @PostConstruct
    public void initMassiveKeys() {
        if (MASSIVE_API_KEY == null || MASSIVE_API_KEY.isBlank()) {
            return;
        }
        for (String key : MASSIVE_API_KEY.split(":")) {
            if (key != null && !key.isBlank()) {
                massiveKeys.add(key.trim());
            }
        }
    }

    private String nextFinnhubKey() {
        if (finnhubKeys.isEmpty()) {
            return FINNHUB_API_KEY;
        }
        int index = Math.floorMod(finnhubKeyIndex.getAndIncrement(), finnhubKeys.size());
        return finnhubKeys.get(index);
    }

    private String nextMassiveKey() {
        if (massiveKeys.isEmpty()) {
            return MASSIVE_API_KEY;
        }
        int index = Math.floorMod(massiveKeyIndex.getAndIncrement(), massiveKeys.size());
        return massiveKeys.get(index);
    }

    /**
     * Search Finnhub for a stock symbol by query (returns the first matching result).
     *
     * @param query search query (symbol or company name)
     * @return 200 with the first search result map, 404 if no result, 500 on error
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStock(@RequestParam(name = "query") String query) {
        String baseUrl = "https://finnhub.io/api/v1/search";
        String token = nextFinnhubKey();

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("q", query.toUpperCase())
            .queryParam("exchange", "US")
            .queryParam("token", token)
            .build().toUri();

        // ensures return is in JSON format
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange( 
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }

        Map<String, Object> body = response.getBody();
        if (body == null)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.valueToTree(body);
        
        JsonNode resultNode = root.path("result");
        if (!resultNode.isArray() || resultNode.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        JsonNode firstResult = resultNode.get(0);
        System.out.println("Search Result: " + firstResult);

        Map<String, Object> firstResultMap = mapper.convertValue(firstResult, new TypeReference<Map<String, Object>>() {});
        return ResponseEntity.ok(firstResultMap);
    }

    /**
     * Lightweight search endpoint used by the UI typeahead / search bar.
     * Returns a list of matching results and a count.
     *
     * @param query partial query string
     * @return 200 with { count, result } map
     */
    @GetMapping("/searchbar")
    public ResponseEntity<Map<String, Object>> searchBar(@RequestParam(name = "query") String query) {
        String baseUrl = "https://finnhub.io/api/v1/search";
        String token = nextFinnhubKey();

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("q", query)
            .queryParam("exchange", "US")
            .queryParam("token", token);
        URI url = builder.build().toUri();

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }

        Map<String, Object> body = response.getBody();
        if (body == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("count", 0);
            empty.put("result", new java.util.ArrayList<>());
            return ResponseEntity.ok(empty);
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.valueToTree(body);
        JsonNode resultNode = root.path("result");

        java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();
        if (resultNode.isArray() && !resultNode.isEmpty()) {
            results = mapper.convertValue(resultNode, new TypeReference<java.util.List<Map<String, Object>>>() {});
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("count", results.size());
        resp.put("result", results);

        return ResponseEntity.ok(resp);
    }

    /**
     * Retrieve news for a given Finnhub category.
     *
     * @param category Finnhub news category
     * @param minId    optional minId to filter newer items
     * @return 200 with { count, result } map of news items
     */
    @GetMapping("/news")
    public ResponseEntity<Map<String, Object>> getNews(
        @RequestParam(name = "category") String category,
        @RequestParam(name = "minId", required = false, defaultValue = "0") long minId) {

        String baseUrl = "https://finnhub.io/api/v1/news";
        String token = nextFinnhubKey();

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("category", category)
                .queryParam("token", token);
        if (minId > 0) builder.queryParam("minId", minId);

        URI url = builder.build().toUri();

        ResponseEntity<java.util.List<Map<String, Object>>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<java.util.List<Map<String, Object>>>() {
                }
        );

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).build();
        }

        java.util.List<Map<String, Object>> body = response.getBody();
        if (body == null) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("count", 0);
            empty.put("result", new java.util.ArrayList<>());
            return ResponseEntity.ok(empty);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("count", body.size());
        resp.put("result", body);

        return ResponseEntity.ok(resp);
    }

    /**
     * Fetch real-time quote data for the given ticker from Finnhub.
     *
     * @param ticker stock ticker symbol
     * @return Finnhub quote map and status forwarded to the caller
     */
    @GetMapping("/quote")
    public ResponseEntity<Map<String, Object>> getQuote(@RequestParam(name = "ticker") String ticker) {
        String baseUrl = "https://finnhub.io/api/v1/quote";
        String token = nextFinnhubKey();

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("symbol", ticker.toUpperCase())
            .queryParam("token", token)
            .build().toUri();

        // ensures return is in JSON format
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange( 
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        System.out.println(ticker + ": " + response.getBody());

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    /**
     * Company profile endpoint (Finnhub /stock/profile2).
     * Accepts one of: symbol, isin, or cusip and returns the profile map.
     *
     * @param symbol ticker symbol (optional)
     * @param isin   ISIN code (optional)
     * @param cusip  CUSIP code (optional)
     * @return 200 with profile map, 400 when no identifier provided, 404 when not found
     */
    @GetMapping("/profile2")
    public ResponseEntity<Map<String, Object>> getCompanyProfile(
        @RequestParam(name = "symbol", required = false) String symbol,
        @RequestParam(name = "isin", required = false) String isin,
        @RequestParam(name = "cusip", required = false) String cusip) {

        String baseUrl = "https://finnhub.io/api/v1/stock/profile2";
        String token = nextFinnhubKey();

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl);
        if (symbol != null && !symbol.isBlank()) {
            builder.queryParam("symbol", symbol.toUpperCase());
        } else if (isin != null && !isin.isBlank()) {
            builder.queryParam("isin", isin);
        } else if (cusip != null && !cusip.isBlank()) {
            builder.queryParam("cusip", cusip);
        } else {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Missing query parameter: provide symbol, isin or cusip");
            return ResponseEntity.badRequest().body(err);
        }

        builder.queryParam("token", token);
        URI url = builder.build().toUri();

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {
                }
        );

        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }

        Map<String, Object> body = response.getBody();
        if (body == null || body.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(body);
    }

    /**
     * Retrieve a filtered set of company metrics from Finnhub for display.
     *
     * @param ticker stock ticker symbol
     * @return 200 with a map of human-friendly metric names to formatted values
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(@RequestParam(name = "ticker") String ticker) {
        String baseUrl = "https://finnhub.io/api/v1/stock/metric";
        String token = nextFinnhubKey();

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("symbol", ticker.toUpperCase())
            .queryParam("token", token)
            .queryParam("metric", "all")
            .build().toUri();
        
        Map<String,String> topMetrics = new HashMap<>();
        topMetrics.put("marketCapitalization", "Market Cap");
        topMetrics.put("peTTM", "P/E Ratio");
        topMetrics.put("forwardPE", "Forward P/E");
        topMetrics.put("epsTTM", "Earnings Per Share");
        topMetrics.put("roeTTM", "Return on Equity");
        topMetrics.put("revenueGrowthTTMYoy", "Revenue Growth");
        topMetrics.put("52WeekHigh", "52-Week High");
        topMetrics.put("52WeekLow", "52-Week Low");
        topMetrics.put("currentRatioQuarterly", "Current Ratio");
        topMetrics.put("dividendYieldIndicatedAnnual", "Dividend Yield");
        topMetrics.put("3MonthAverageTradingVolume", "Average Volume");

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange( 
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }

        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("metric")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.valueToTree(body);
        JsonNode metricNode = root.path("metric");

        Map<String, Object> filteredMetrics = new HashMap<>();

        DecimalFormat df = new DecimalFormat("#,##0.00");

        for (Map.Entry<String, String> entry : topMetrics.entrySet()) {
            if (metricNode.has(entry.getKey()) && !metricNode.get(entry.getKey()).isNull()) {
                double value = metricNode.get(entry.getKey()).asDouble();
                String formatted =  df.format(value);
                filteredMetrics.put(entry.getValue(), formatted);
            }
        }

        return ResponseEntity.ok(filteredMetrics);
    }


    /**
     * Get historical aggregate data (Massive API) for a ticker.
     * Supports optional ranges (e.g. "1W" for one week).
     *
     * @param ticker stock ticker symbol
     * @param range  optional range code (e.g. "1W", "1D")
     * @return 200 with Massive API response map containing "results"
     */
    @GetMapping("/historical")
    public ResponseEntity<Map<String, Object>> getHistorical(
        @RequestParam(name = "ticker") String ticker,
        @RequestParam(name = "range", required = false) String range) {
        String baseUrl = "https://api.massive.com/v2/aggs";
        String apiKey = nextMassiveKey();

        String multiplier = "1";
        String timespan = "day";
        LocalDate startDate = LocalDate.now().minusYears(2);
        LocalDate endDate = LocalDate.now();
        
        // range can be 1W for 1 week or 1D for 1 day
        if ("1W".equalsIgnoreCase(range)){
            multiplier = "1";
            timespan = "hour";
            startDate = LocalDate.now().minusWeeks(1);
        }

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .path("/ticker/" + ticker)
            .path("/range/" + multiplier)
            .path("/"+ timespan)
            .path("/" + startDate + "/" + endDate)
            .queryParam("adjusted", "true")
            .queryParam("sort", "asc")
            .queryParam("limit", "5000")
            .queryParam("apiKey", apiKey)
            .build().toUri();

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange( 
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        if (!response.getStatusCode().equals(HttpStatus.OK)) {
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        }

        Map<String, Object> body = response.getBody();
        if (body == null || !body.containsKey("results")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.ok(body);
    }
}
