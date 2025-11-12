package team8.backend.controller;

import org.springframework.web.bind.annotation.*;
import team8.backend.dto.HoldingDTO;
import team8.backend.service.HoldingService;

import java.util.List;

/**
 * Controller exposing endpoints for holdings operations.
 * Allows retrieval of holdings for a given account and deletion of individual holdings.
 */
@RestController
@RequestMapping("/api/holdings")
@CrossOrigin(origins = "*") // adjust if needed
public class HoldingController {

    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    /**
     * Get holdings for a specific account.
     *
     * @param accountId id of the account
     * @return list of HoldingDTO objects for the account
     */
    @GetMapping("/account/{accountId}")
    public List<HoldingDTO> getHoldingsByAccount(@PathVariable(name = "accountId") Long accountId) {
        return holdingService.getHoldingsByAccount(accountId);
    }

    /**
     * Delete a holding by its id.
     *
     * @param holdingId id of the holding to delete
     */
    @DeleteMapping("/{holdingId}")
    public void deleteHolding(@PathVariable(name = "holdingId") Long holdingId) {
        holdingService.deleteHolding(holdingId);
    }
}
