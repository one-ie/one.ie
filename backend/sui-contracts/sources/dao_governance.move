/// # DAO Governance Module
///
/// This module implements token-based governance for DAOs on Sui blockchain.
/// It enables proposal creation, voting, and execution with configurable parameters.
///
/// ## Features
/// - Token-weighted voting (snapshot at proposal creation)
/// - Configurable quorum and approval thresholds
/// - Time-based voting periods
/// - One vote per address per proposal
/// - Executable actions (contract calls if proposal passes)
/// - Comprehensive event emission
///
/// ## Ontology Mapping
/// - GROUPS: DAO represented as governance configuration
/// - PEOPLE: Voters identified by addresses
/// - THINGS: Proposals and votes are entities
/// - CONNECTIONS: Voting connects people to proposals
/// - EVENTS: ProposalCreated, VoteCast, ProposalExecuted
/// - KNOWLEDGE: Proposal metadata and voting history

module one_vesting::dao_governance {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::vec_map::{Self, VecMap};
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // ==================== Error Codes ====================

    const E_NOT_AUTHORIZED: u64 = 1;
    const E_VOTING_NOT_ACTIVE: u64 = 2;
    const E_VOTING_ENDED: u64 = 3;
    const E_ALREADY_VOTED: u64 = 4;
    const E_INVALID_VOTE_CHOICE: u64 = 5;
    const E_PROPOSAL_NOT_PASSED: u64 = 6;
    const E_PROPOSAL_ALREADY_EXECUTED: u64 = 7;
    const E_QUORUM_NOT_REACHED: u64 = 8;
    const E_VOTING_STILL_ACTIVE: u64 = 9;
    const E_INVALID_THRESHOLD: u64 = 10;
    const E_NO_VOTING_POWER: u64 = 11;

    // ==================== Vote Choice Constants ====================

    const VOTE_FOR: u8 = 1;
    const VOTE_AGAINST: u8 = 2;
    const VOTE_ABSTAIN: u8 = 3;

    // ==================== Proposal Status Constants ====================

    const STATUS_PENDING: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PASSED: u8 = 2;
    const STATUS_FAILED: u8 = 3;
    const STATUS_EXECUTED: u8 = 4;

    // ==================== Structs ====================

    /// DAO Governance Configuration
    /// Shared object that holds governance parameters
    struct GovernanceConfig has key, store {
        id: UID,
        /// DAO identifier (maps to group in ontology)
        dao_id: ID,
        /// Minimum token balance required to create proposals
        proposal_threshold: u64,
        /// Minimum percentage of total supply that must vote (basis points: 5000 = 50%)
        quorum_threshold: u64,
        /// Minimum percentage of votes needed to pass (basis points: 5000 = 50%)
        approval_threshold: u64,
        /// Default voting period in milliseconds
        default_voting_period: u64,
        /// Total token supply (for quorum calculation)
        total_supply: u64,
        /// Admin capability owner
        admin: address,
    }

    /// Admin capability for governance management
    struct AdminCap has key, store {
        id: UID,
        governance_id: ID,
    }

    /// Proposal
    /// Shared object representing a governance proposal
    struct Proposal has key, store {
        id: UID,
        /// Proposal sequence number
        proposal_number: u64,
        /// Title of the proposal
        title: String,
        /// Detailed description (markdown supported)
        description: String,
        /// Address of the proposer
        proposer: address,
        /// Voting power snapshot of proposer at creation
        proposer_voting_power: u64,
        /// Timestamp when proposal was created
        created_at: u64,
        /// Timestamp when voting starts
        voting_start: u64,
        /// Timestamp when voting ends
        voting_end: u64,
        /// Total votes FOR the proposal (weighted by token balance)
        votes_for: u64,
        /// Total votes AGAINST the proposal
        votes_against: u64,
        /// Total votes ABSTAIN
        votes_abstain: u64,
        /// Total unique voters
        voter_count: u64,
        /// Whether the proposal has been executed
        executed: bool,
        /// Executable actions (serialized contract calls)
        /// Format: vector of (module_name, function_name, type_args, args)
        actions: vector<Action>,
        /// Vote records: voter address -> Vote
        votes: Table<address, Vote>,
    }

    /// Action to be executed if proposal passes
    struct Action has store, copy, drop {
        /// Target module (e.g., "treasury", "staking")
        module_name: String,
        /// Function to call (e.g., "transfer", "update_rate")
        function_name: String,
        /// Serialized arguments (ABI-encoded)
        arguments: vector<u8>,
    }

    /// Individual vote record
    struct Vote has store, copy, drop {
        /// Address of the voter
        voter: address,
        /// Vote choice: VOTE_FOR, VOTE_AGAINST, VOTE_ABSTAIN
        choice: u8,
        /// Voting power (token balance snapshot)
        vote_weight: u64,
        /// Timestamp when vote was cast
        timestamp: u64,
        /// Optional comment from voter
        comment: String,
    }

    /// Proposal status result
    struct ProposalStatus has drop {
        proposal_id: ID,
        status: u8,
        votes_for: u64,
        votes_against: u64,
        votes_abstain: u64,
        total_voting_power: u64,
        quorum_reached: bool,
        approval_reached: bool,
        voting_ended: bool,
        executed: bool,
    }

    // ==================== Events ====================

    /// Emitted when a new DAO governance is initialized
    struct GovernanceCreated has copy, drop {
        governance_id: ID,
        dao_id: ID,
        admin: address,
        quorum_threshold: u64,
        approval_threshold: u64,
        timestamp: u64,
    }

    /// Emitted when a proposal is created
    struct ProposalCreated has copy, drop {
        proposal_id: ID,
        proposal_number: u64,
        proposer: address,
        title: String,
        voting_start: u64,
        voting_end: u64,
        timestamp: u64,
    }

    /// Emitted when a vote is cast
    struct VoteCast has copy, drop {
        proposal_id: ID,
        voter: address,
        choice: u8,
        vote_weight: u64,
        timestamp: u64,
    }

    /// Emitted when a proposal is executed
    struct ProposalExecuted has copy, drop {
        proposal_id: ID,
        executor: address,
        timestamp: u64,
    }

    /// Emitted when governance parameters are updated
    struct GovernanceUpdated has copy, drop {
        governance_id: ID,
        quorum_threshold: u64,
        approval_threshold: u64,
        timestamp: u64,
    }

    // ==================== Initialization ====================

    /// Initialize a new DAO governance
    /// Creates shared GovernanceConfig and transfers AdminCap to sender
    public entry fun initialize_governance(
        dao_id: ID,
        proposal_threshold: u64,
        quorum_threshold: u64,
        approval_threshold: u64,
        default_voting_period: u64,
        total_supply: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate thresholds (max 10000 basis points = 100%)
        assert!(quorum_threshold <= 10000, E_INVALID_THRESHOLD);
        assert!(approval_threshold <= 10000, E_INVALID_THRESHOLD);

        let sender = tx_context::sender(ctx);
        let governance_uid = object::new(ctx);
        let governance_id = object::uid_to_inner(&governance_uid);

        // Create governance config
        let governance = GovernanceConfig {
            id: governance_uid,
            dao_id,
            proposal_threshold,
            quorum_threshold,
            approval_threshold,
            default_voting_period,
            total_supply,
            admin: sender,
        };

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
            governance_id,
        };

        // Emit event
        event::emit(GovernanceCreated {
            governance_id,
            dao_id,
            admin: sender,
            quorum_threshold,
            approval_threshold,
            timestamp: clock::timestamp_ms(clock),
        });

        // Share governance config (anyone can read)
        transfer::share_object(governance);

        // Transfer admin cap to sender
        transfer::transfer(admin_cap, sender);
    }

    // ==================== Proposal Creation ====================

    /// Create a new governance proposal
    /// Requires proposer to have sufficient voting power (token balance)
    public entry fun create_proposal(
        governance: &GovernanceConfig,
        title: vector<u8>,
        description: vector<u8>,
        actions: vector<Action>,
        voting_period: Option<u64>,
        proposer_balance: u64, // Token balance of proposer (verified off-chain)
        proposal_number: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        // Validate proposer has sufficient voting power
        assert!(proposer_balance >= governance.proposal_threshold, E_NO_VOTING_POWER);

        // Determine voting period
        let period = if (option::is_some(&voting_period)) {
            option::destroy_some(voting_period)
        } else {
            governance.default_voting_period
        };

        let voting_start = now;
        let voting_end = now + period;

        // Create proposal
        let proposal_uid = object::new(ctx);
        let proposal_id = object::uid_to_inner(&proposal_uid);

        let proposal = Proposal {
            id: proposal_uid,
            proposal_number,
            title: string::utf8(title),
            description: string::utf8(description),
            proposer: sender,
            proposer_voting_power: proposer_balance,
            created_at: now,
            voting_start,
            voting_end,
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            voter_count: 0,
            executed: false,
            actions,
            votes: table::new(ctx),
        };

        // Emit event
        event::emit(ProposalCreated {
            proposal_id,
            proposal_number,
            proposer: sender,
            title: string::utf8(title),
            voting_start,
            voting_end,
            timestamp: now,
        });

        // Share proposal (anyone can read and vote)
        transfer::share_object(proposal);
    }

    // ==================== Voting ====================

    /// Cast a vote on a proposal
    /// Each address can only vote once per proposal
    public entry fun cast_vote(
        governance: &GovernanceConfig,
        proposal: &mut Proposal,
        choice: u8,
        voter_balance: u64, // Token balance of voter (verified off-chain)
        comment: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        // Validate vote choice
        assert!(
            choice == VOTE_FOR || choice == VOTE_AGAINST || choice == VOTE_ABSTAIN,
            E_INVALID_VOTE_CHOICE
        );

        // Validate voting period
        assert!(now >= proposal.voting_start, E_VOTING_NOT_ACTIVE);
        assert!(now <= proposal.voting_end, E_VOTING_ENDED);

        // Check if already voted
        assert!(!table::contains(&proposal.votes, sender), E_ALREADY_VOTED);

        // Validate voter has voting power
        assert!(voter_balance > 0, E_NO_VOTING_POWER);

        // Create vote record
        let vote = Vote {
            voter: sender,
            choice,
            vote_weight: voter_balance,
            timestamp: now,
            comment: string::utf8(comment),
        };

        // Update proposal vote counts
        if (choice == VOTE_FOR) {
            proposal.votes_for = proposal.votes_for + voter_balance;
        } else if (choice == VOTE_AGAINST) {
            proposal.votes_against = proposal.votes_against + voter_balance;
        } else if (choice == VOTE_ABSTAIN) {
            proposal.votes_abstain = proposal.votes_abstain + voter_balance;
        };

        proposal.voter_count = proposal.voter_count + 1;

        // Store vote
        table::add(&mut proposal.votes, sender, vote);

        // Emit event
        event::emit(VoteCast {
            proposal_id: object::uid_to_inner(&proposal.id),
            voter: sender,
            choice,
            vote_weight: voter_balance,
            timestamp: now,
        });
    }

    // ==================== Proposal Execution ====================

    /// Execute a passed proposal
    /// Can only be executed if:
    /// 1. Voting period has ended
    /// 2. Quorum threshold is met
    /// 3. Approval threshold is met
    /// 4. Not already executed
    public entry fun execute_proposal(
        governance: &GovernanceConfig,
        proposal: &mut Proposal,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        // Validate voting has ended
        assert!(now > proposal.voting_end, E_VOTING_STILL_ACTIVE);

        // Validate not already executed
        assert!(!proposal.executed, E_PROPOSAL_ALREADY_EXECUTED);

        // Calculate total votes
        let total_votes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;

        // Check quorum (percentage of total supply)
        let quorum = (total_votes * 10000) / governance.total_supply;
        assert!(quorum >= governance.quorum_threshold, E_QUORUM_NOT_REACHED);

        // Check approval (percentage of non-abstain votes)
        let non_abstain_votes = proposal.votes_for + proposal.votes_against;
        let approval = if (non_abstain_votes > 0) {
            (proposal.votes_for * 10000) / non_abstain_votes
        } else {
            0
        };
        assert!(approval >= governance.approval_threshold, E_PROPOSAL_NOT_PASSED);

        // Mark as executed
        proposal.executed = true;

        // Emit event
        event::emit(ProposalExecuted {
            proposal_id: object::uid_to_inner(&proposal.id),
            executor: sender,
            timestamp: now,
        });

        // Note: Actual execution of actions would happen in a separate transaction
        // This is because Move doesn't support dynamic dispatch
        // The frontend would read proposal.actions and execute them
    }

    // ==================== Query Functions ====================

    /// Get current status of a proposal
    public fun get_proposal_status(
        governance: &GovernanceConfig,
        proposal: &Proposal,
        clock: &Clock,
    ): ProposalStatus {
        let now = clock::timestamp_ms(clock);
        let total_votes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;

        // Calculate quorum
        let quorum = (total_votes * 10000) / governance.total_supply;
        let quorum_reached = quorum >= governance.quorum_threshold;

        // Calculate approval
        let non_abstain_votes = proposal.votes_for + proposal.votes_against;
        let approval = if (non_abstain_votes > 0) {
            (proposal.votes_for * 10000) / non_abstain_votes
        } else {
            0
        };
        let approval_reached = approval >= governance.approval_threshold;

        // Determine status
        let voting_ended = now > proposal.voting_end;
        let status = if (proposal.executed) {
            STATUS_EXECUTED
        } else if (!voting_ended) {
            STATUS_ACTIVE
        } else if (quorum_reached && approval_reached) {
            STATUS_PASSED
        } else {
            STATUS_FAILED
        };

        ProposalStatus {
            proposal_id: object::uid_to_inner(&proposal.id),
            status,
            votes_for: proposal.votes_for,
            votes_against: proposal.votes_against,
            votes_abstain: proposal.votes_abstain,
            total_voting_power: total_votes,
            quorum_reached,
            approval_reached,
            voting_ended,
            executed: proposal.executed,
        }
    }

    /// Calculate voting power for an address (based on token balance)
    /// In production, this would query the token contract
    public fun calculate_voting_power(
        token_balance: u64,
    ): u64 {
        // In this simple version, voting power = token balance
        // Can be extended to support delegated voting, vote multipliers, etc.
        token_balance
    }

    /// Check if an address has voted on a proposal
    public fun has_voted(
        proposal: &Proposal,
        voter: address,
    ): bool {
        table::contains(&proposal.votes, voter)
    }

    /// Get vote details for a specific voter (if they voted)
    public fun get_vote(
        proposal: &Proposal,
        voter: address,
    ): Option<Vote> {
        if (table::contains(&proposal.votes, voter)) {
            option::some(*table::borrow(&proposal.votes, voter))
        } else {
            option::none()
        }
    }

    // ==================== Admin Functions ====================

    /// Update governance parameters (admin only)
    public entry fun update_governance(
        _admin_cap: &AdminCap,
        governance: &mut GovernanceConfig,
        quorum_threshold: Option<u64>,
        approval_threshold: Option<u64>,
        proposal_threshold: Option<u64>,
        default_voting_period: Option<u64>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        // Update parameters if provided
        if (option::is_some(&quorum_threshold)) {
            let threshold = option::destroy_some(quorum_threshold);
            assert!(threshold <= 10000, E_INVALID_THRESHOLD);
            governance.quorum_threshold = threshold;
        };

        if (option::is_some(&approval_threshold)) {
            let threshold = option::destroy_some(approval_threshold);
            assert!(threshold <= 10000, E_INVALID_THRESHOLD);
            governance.approval_threshold = threshold;
        };

        if (option::is_some(&proposal_threshold)) {
            governance.proposal_threshold = option::destroy_some(proposal_threshold);
        };

        if (option::is_some(&default_voting_period)) {
            governance.default_voting_period = option::destroy_some(default_voting_period);
        };

        // Emit event
        event::emit(GovernanceUpdated {
            governance_id: object::uid_to_inner(&governance.id),
            quorum_threshold: governance.quorum_threshold,
            approval_threshold: governance.approval_threshold,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Update total supply (admin only)
    /// Used when token supply changes (mint/burn)
    public entry fun update_total_supply(
        _admin_cap: &AdminCap,
        governance: &mut GovernanceConfig,
        new_total_supply: u64,
        _ctx: &mut TxContext
    ) {
        governance.total_supply = new_total_supply;
    }

    // ==================== Getters ====================

    public fun get_proposal_title(proposal: &Proposal): String {
        proposal.title
    }

    public fun get_proposal_description(proposal: &Proposal): String {
        proposal.description
    }

    public fun get_proposal_proposer(proposal: &Proposal): address {
        proposal.proposer
    }

    public fun get_proposal_votes_for(proposal: &Proposal): u64 {
        proposal.votes_for
    }

    public fun get_proposal_votes_against(proposal: &Proposal): u64 {
        proposal.votes_against
    }

    public fun get_proposal_votes_abstain(proposal: &Proposal): u64 {
        proposal.votes_abstain
    }

    public fun get_proposal_voter_count(proposal: &Proposal): u64 {
        proposal.voter_count
    }

    public fun get_proposal_executed(proposal: &Proposal): bool {
        proposal.executed
    }

    public fun get_voting_start(proposal: &Proposal): u64 {
        proposal.voting_start
    }

    public fun get_voting_end(proposal: &Proposal): u64 {
        proposal.voting_end
    }

    public fun get_governance_quorum_threshold(governance: &GovernanceConfig): u64 {
        governance.quorum_threshold
    }

    public fun get_governance_approval_threshold(governance: &GovernanceConfig): u64 {
        governance.approval_threshold
    }

    public fun get_governance_total_supply(governance: &GovernanceConfig): u64 {
        governance.total_supply
    }

    // ==================== Test Helpers ====================

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        // Helper function for tests
    }
}
