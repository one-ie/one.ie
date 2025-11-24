#[test_only]
module treasury::multi_sig_tests {
    use treasury::multi_sig::{Self, Treasury, PendingTransaction};
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_utils;

    // Test addresses
    const OWNER1: address = @0xA1;
    const OWNER2: address = @0xA2;
    const OWNER3: address = @0xA3;
    const OWNER4: address = @0xA4;
    const OWNER5: address = @0xA5;
    const RECIPIENT: address = @0xB1;

    // Test helper: Create a 3-of-5 treasury
    fun setup_treasury(scenario: &mut Scenario) {
        ts::next_tx(scenario, OWNER1);
        {
            let owners = vector[OWNER1, OWNER2, OWNER3, OWNER4, OWNER5];
            multi_sig::create_treasury(owners, 3, ts::ctx(scenario));
        };
    }

    // Test helper: Deposit SUI into treasury
    fun deposit_sui(scenario: &mut Scenario, sender: address, amount: u64) {
        ts::next_tx(scenario, sender);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let coin = coin::mint_for_testing<SUI>(amount, ts::ctx(scenario));
            multi_sig::deposit_sui(&mut treasury, coin, ts::ctx(scenario));
            ts::return_shared(treasury);
        };
    }

    #[test]
    fun test_create_treasury_success() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);

        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);

            // Verify threshold
            assert!(multi_sig::get_threshold(&treasury) == 3, 0);

            // Verify owners
            let owners = multi_sig::get_owners(&treasury);
            assert!(vector::length(&owners) == 5, 1);
            assert!(vector::contains(&owners, &OWNER1), 2);
            assert!(vector::contains(&owners, &OWNER5), 3);

            // Verify balance is zero
            assert!(multi_sig::get_balance(&treasury) == 0, 4);

            ts::return_shared(treasury);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_INVALID_THRESHOLD)]
    fun test_create_treasury_invalid_threshold_too_high() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        ts::next_tx(scenario, OWNER1);
        {
            let owners = vector[OWNER1, OWNER2, OWNER3];
            // Threshold (4) > owner count (3) - should fail
            multi_sig::create_treasury(owners, 4, ts::ctx(scenario));
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_INVALID_THRESHOLD)]
    fun test_create_treasury_invalid_threshold_zero() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        ts::next_tx(scenario, OWNER1);
        {
            let owners = vector[OWNER1, OWNER2, OWNER3];
            // Threshold cannot be 0
            multi_sig::create_treasury(owners, 0, ts::ctx(scenario));
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_deposit_sui() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);

        // Deposit 10 SUI
        let deposit_amount = 10_000_000_000; // 10 SUI in MIST
        deposit_sui(scenario, OWNER1, deposit_amount);

        // Verify balance
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            assert!(multi_sig::get_balance(&treasury) == deposit_amount, 0);
            ts::return_shared(treasury);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_propose_transfer() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // OWNER1 proposes transfer
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let transfer_amount = 1_000_000_000; // 1 SUI
            multi_sig::propose_transfer(
                &mut treasury,
                RECIPIENT,
                transfer_amount,
                0, // Use default expiry
                ts::ctx(scenario)
            );
            ts::return_shared(treasury);
        };

        // Verify pending transaction created
        ts::next_tx(scenario, OWNER1);
        {
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);

            // Verify transaction details
            let (tx_type, to, amount, executed, _, _) = multi_sig::get_transaction_details(&pending_tx);
            assert!(tx_type == 1, 0); // TX_TYPE_TRANSFER
            assert!(option::is_some(&to), 1);
            assert!(*option::borrow(&to) == RECIPIENT, 2);
            assert!(amount == 1_000_000_000, 3);
            assert!(!executed, 4);

            // Verify no approvals yet
            assert!(multi_sig::get_approval_count(&pending_tx) == 0, 5);

            ts::return_shared(pending_tx);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_approve_transaction() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // Propose transfer
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, 1_000_000_000, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        // OWNER2 approves
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);

            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            assert!(multi_sig::get_approval_count(&pending_tx) == 1, 0);

            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // OWNER3 approves
        ts::next_tx(scenario, OWNER3);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);

            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            assert!(multi_sig::get_approval_count(&pending_tx) == 2, 1);

            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_ALREADY_APPROVED)]
    fun test_double_approval_fails() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // Propose transfer
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, 1_000_000_000, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        // OWNER2 approves
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // OWNER2 tries to approve again - should fail
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::end(scenario_val);
    }

    #[test]
    fun test_execute_transfer_success() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        let transfer_amount = 1_000_000_000;

        // Propose transfer
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, transfer_amount, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        // Get 3 approvals (threshold)
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER3);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER4);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // Execute transaction
        ts::next_tx(scenario, OWNER5);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);

            let balance_before = multi_sig::get_balance(&treasury);
            multi_sig::execute_transaction(&mut treasury, &mut pending_tx, ts::ctx(scenario));
            let balance_after = multi_sig::get_balance(&treasury);

            // Verify balance decreased
            assert!(balance_before - balance_after == transfer_amount, 0);

            // Verify transaction marked as executed
            assert!(multi_sig::is_executed(&pending_tx), 1);

            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // Verify recipient received funds
        ts::next_tx(scenario, RECIPIENT);
        {
            let received_coin = ts::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&received_coin) == transfer_amount, 2);
            ts::return_to_sender(scenario, received_coin);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_INSUFFICIENT_APPROVALS)]
    fun test_execute_without_threshold_fails() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // Propose transfer
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, 1_000_000_000, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        // Only 2 approvals (threshold is 3)
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER3);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // Try to execute with only 2 approvals - should fail
        ts::next_tx(scenario, OWNER4);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::execute_transaction(&mut treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_ALREADY_EXECUTED)]
    fun test_execute_twice_fails() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // Propose, approve, and execute
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, 1_000_000_000, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        // Get approvals and execute
        ts::next_tx(scenario, OWNER2);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER3);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER4);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::approve_transaction(&treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::next_tx(scenario, OWNER5);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::execute_transaction(&mut treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        // Try to execute again - should fail
        ts::next_tx(scenario, OWNER1);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            let pending_tx = ts::take_shared<PendingTransaction>(scenario);
            multi_sig::execute_transaction(&mut treasury, &mut pending_tx, ts::ctx(scenario));
            ts::return_shared(treasury);
            ts::return_shared(pending_tx);
        };

        ts::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = multi_sig::E_NOT_OWNER)]
    fun test_non_owner_cannot_propose() {
        let scenario_val = ts::begin(OWNER1);
        let scenario = &mut scenario_val;

        setup_treasury(scenario);
        deposit_sui(scenario, OWNER1, 10_000_000_000);

        // Non-owner tries to propose
        let non_owner = @0xDEAD;
        ts::next_tx(scenario, non_owner);
        {
            let treasury = ts::take_shared<Treasury>(scenario);
            multi_sig::propose_transfer(&mut treasury, RECIPIENT, 1_000_000_000, 0, ts::ctx(scenario));
            ts::return_shared(treasury);
        };

        ts::end(scenario_val);
    }
}
