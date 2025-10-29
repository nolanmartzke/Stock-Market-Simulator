package team8.backend.controller;

import org.springframework.web.bind.annotation.*;
import team8.backend.entity.Holding;
import team8.backend.service.HoldingService;

import java.util.List;

@RestController
@RequestMapping("/api/holdings")
@CrossOrigin(origins = "*") // adjust if needed
public class HoldingController {

    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    @GetMapping("/account/{accountId}")
    public List<Holding> getHoldingsByAccount(@PathVariable Long accountId) {
        return holdingService.getHoldingsByAccount(accountId);
    }

    @DeleteMapping("/{holdingId}")
    public void deleteHolding(@PathVariable Long holdingId) {
        holdingService.deleteHolding(holdingId);
    }
}