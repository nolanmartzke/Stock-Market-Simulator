package team8.backend.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.text.DecimalFormat;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/stock")
public class StockController {

    @Value("${finnhub.api-key}")
    private String API_KEY;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStock(@RequestParam String query) {
        String baseUrl = "https://finnhub.io/api/v1/search";

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("q", query.toUpperCase())
            .queryParam("exchange", "US")
            .queryParam("token", API_KEY)
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
        System.out.println(firstResult);

        Map<String, Object> firstResultMap = mapper.convertValue(firstResult, new TypeReference<Map<String, Object>>() {});
        return ResponseEntity.ok(firstResultMap);
    }

    @GetMapping("/searchbar")
    public ResponseEntity<Map<String, Object>> searchBar(@RequestParam String query) {
        String baseUrl = "https://finnhub.io/api/v1/search";

        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("q", query)
            .queryParam("exchange", "US")
            .queryParam("token", API_KEY);
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

    @GetMapping("/quote")
    public ResponseEntity<Map<String, Object>> getQuote(@RequestParam String ticker) {
        String baseUrl = "https://finnhub.io/api/v1/quote";

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("symbol", ticker.toUpperCase())
            .queryParam("token", API_KEY)
            .build().toUri();

        // ensures return is in JSON format
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange( 
            url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        System.out.println(response.getBody());

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(@RequestParam String ticker) {
        String baseUrl = "https://finnhub.io/api/v1/stock/metric";

        URI url = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("symbol", ticker.toUpperCase())
            .queryParam("token", API_KEY)
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
        System.out.println(filteredMetrics);

        return ResponseEntity.ok(filteredMetrics);
    }
}
