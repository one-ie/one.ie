/**
 * CloneRouter Component
 *
 * UI for configuring and testing clone routing rules.
 * Part of Cycle 13: Multi-Clone Orchestration
 *
 * Features:
 * - Configure routing rules (expertise, topics, load balancing)
 * - Test routing with sample messages
 * - View routing analytics
 * - Manage clone collaboration
 * - Compare clone versions
 */

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import styles from './CloneRouter.module.css';

interface CloneRouterProps {
  groupId: Id<'groups'>;
  creatorId: Id<'people'>;
  userId?: string;
}

interface RoutingResult {
  cloneId: Id<'things'>;
  reason: string;
  confidence: number;
  clone: any;
  alternatives?: Array<{
    cloneId: Id<'things'>;
    name: string;
    score: number;
    reasons: string[];
  }>;
}

export default function CloneRouter({
  groupId,
  creatorId,
  userId,
}: CloneRouterProps) {
  const [activeTab, setActiveTab] = useState<
    'routing' | 'collaboration' | 'comparison' | 'versioning'
  >('routing');

  return (
    <div className={styles['clone-router']}>
      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'routing' ? styles.active : ''}`}
          onClick={() => setActiveTab('routing')}
        >
          Routing
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'collaboration' ? styles.active : ''}`}
          onClick={() => setActiveTab('collaboration')}
        >
          Collaboration
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'comparison' ? styles.active : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          Comparison
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'versioning' ? styles.active : ''}`}
          onClick={() => setActiveTab('versioning')}
        >
          Versioning
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles['tab-content']}>
        {activeTab === 'routing' && (
          <RoutingTab
            groupId={groupId}
            creatorId={creatorId}
            userId={userId}
          />
        )}
        {activeTab === 'collaboration' && (
          <CollaborationTab groupId={groupId} creatorId={creatorId} />
        )}
        {activeTab === 'comparison' && (
          <ComparisonTab groupId={groupId} creatorId={creatorId} />
        )}
        {activeTab === 'versioning' && (
          <VersioningTab groupId={groupId} creatorId={creatorId} />
        )}
      </div>
    </div>
  );
}

/**
 * Routing Tab - Test and configure clone routing
 */
function RoutingTab({
  groupId,
  creatorId,
  userId,
}: {
  groupId: Id<'groups'>;
  creatorId: Id<'people'>;
  userId?: string;
}) {
  const [testMessage, setTestMessage] = useState('');
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const routeToClone = useMutation(
    api.mutations['clone-orchestration'].routeToClone
  );

  const handleTestRouting = async () => {
    if (!testMessage.trim()) return;

    setLoading(true);
    try {
      const result = await routeToClone({
        groupId,
        userId,
        message: testMessage,
        creatorId,
      });

      setRoutingResult(result as RoutingResult);
    } catch (error) {
      console.error('Routing failed:', error);
      alert(`Routing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Sample test messages
  const sampleMessages = [
    'How do I use React hooks?',
    'What is your pricing?',
    'Can you help me with CSS grid?',
    'Tell me about your marketing services',
    'How do I deploy to Cloudflare Pages?',
  ];

  return (
    <div className="routing-tab">
      <h2>Clone Routing</h2>
      <p>Test which clone will handle different types of messages</p>

      {/* Test Input */}
      <div className="test-section">
        <h3>Test Message</h3>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter a test message..."
          rows={4}
          className="test-input"
        />

        <div className="sample-messages">
          <p>Try these samples:</p>
          {sampleMessages.map((msg, idx) => (
            <button
              key={idx}
              onClick={() => setTestMessage(msg)}
              className="sample-btn"
            >
              {msg}
            </button>
          ))}
        </div>

        <button
          onClick={handleTestRouting}
          disabled={loading || !testMessage.trim()}
          className="test-btn"
        >
          {loading ? 'Testing...' : 'Test Routing'}
        </button>
      </div>

      {/* Routing Result */}
      {routingResult && (
        <div className="routing-result">
          <h3>Routing Result</h3>

          <div className="selected-clone">
            <h4>Selected Clone</h4>
            <div className="clone-card primary">
              <div className="clone-name">{routingResult.clone.name}</div>
              <div className="confidence">
                Confidence: {(routingResult.confidence * 100).toFixed(0)}%
              </div>
              <div className="reason">Reason: {routingResult.reason}</div>
            </div>
          </div>

          {routingResult.alternatives &&
            routingResult.alternatives.length > 0 && (
              <div className="alternatives">
                <h4>Alternative Clones</h4>
                {routingResult.alternatives.map((alt) => (
                  <div key={alt.cloneId} className="clone-card alternative">
                    <div className="clone-name">{alt.name}</div>
                    <div className="score">Score: {alt.score.toFixed(1)}</div>
                    <div className="reasons">
                      {alt.reasons.map((r, i) => (
                        <span key={i} className="reason-tag">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

/**
 * Collaboration Tab - Configure multi-clone collaboration
 */
function CollaborationTab({
  groupId,
  creatorId,
}: {
  groupId: Id<'groups'>;
  creatorId: Id<'people'>;
}) {
  const [selectedClones, setSelectedClones] = useState<Id<'things'>[]>([]);
  const [strategy, setStrategy] = useState<
    'round_robin' | 'best_match' | 'parallel'
  >('best_match');

  const collaborateClones = useMutation(
    api.mutations['clone-orchestration'].collaborateClones
  );

  // In a real implementation, we'd fetch available clones
  // const clones = useQuery(api.queries['ai-clones'].listClones, { groupId });

  return (
    <div className="collaboration-tab">
      <h2>Clone Collaboration</h2>
      <p>Enable multiple clones to work together on conversations</p>

      <div className="collaboration-config">
        <h3>Select Clones</h3>
        <p className="hint">
          Choose 2 or more clones with different expertise to collaborate
        </p>

        {/* Clone selection would go here */}
        <div className="clone-selection">
          <p>
            <em>Clone selection UI - connect to listClones query</em>
          </p>
        </div>

        <h3>Collaboration Strategy</h3>
        <div className="strategy-options">
          <label className="strategy-option">
            <input
              type="radio"
              value="best_match"
              checked={strategy === 'best_match'}
              onChange={(e) =>
                setStrategy(e.target.value as typeof strategy)
              }
            />
            <div>
              <strong>Best Match</strong>
              <p>Route each message to the clone with best expertise</p>
            </div>
          </label>

          <label className="strategy-option">
            <input
              type="radio"
              value="round_robin"
              checked={strategy === 'round_robin'}
              onChange={(e) =>
                setStrategy(e.target.value as typeof strategy)
              }
            />
            <div>
              <strong>Round Robin</strong>
              <p>Rotate between clones for load balancing</p>
            </div>
          </label>

          <label className="strategy-option">
            <input
              type="radio"
              value="parallel"
              checked={strategy === 'parallel'}
              onChange={(e) =>
                setStrategy(e.target.value as typeof strategy)
              }
            />
            <div>
              <strong>Parallel</strong>
              <p>All clones respond, user picks best answer</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison Tab - A/B test different clones
 */
function ComparisonTab({
  groupId,
  creatorId,
}: {
  groupId: Id<'groups'>;
  creatorId: Id<'people'>;
}) {
  const [selectedClones, setSelectedClones] = useState<Id<'things'>[]>([]);
  const [testPrompts, setTestPrompts] = useState<string[]>([
    'Explain your main service',
    'What makes you different?',
    'How much does it cost?',
  ]);

  const compareClones = useMutation(
    api.mutations['clone-orchestration'].compareClones
  );

  const handleCompare = async () => {
    if (selectedClones.length < 2) {
      alert('Select at least 2 clones to compare');
      return;
    }

    try {
      const result = await compareClones({
        cloneIds: selectedClones,
        testPrompts,
        evaluationCriteria: {
          accuracy: true,
          tone: true,
          length: true,
          expertise: true,
        },
      });

      console.log('Comparison created:', result);
      alert(`Comparison created! ID: ${result.comparisonId}`);
    } catch (error) {
      console.error('Comparison failed:', error);
      alert(`Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="comparison-tab">
      <h2>Clone Comparison</h2>
      <p>A/B test different clones or system prompts</p>

      <div className="comparison-config">
        <h3>Select Clones to Compare</h3>
        <p className="hint">Choose 2 or more clones to test against each other</p>

        {/* Clone selection UI would go here */}
        <div className="clone-selection">
          <p>
            <em>Clone selection UI - connect to listClones query</em>
          </p>
        </div>

        <h3>Test Prompts</h3>
        <p className="hint">
          Add prompts that represent typical user questions
        </p>
        {testPrompts.map((prompt, idx) => (
          <div key={idx} className="test-prompt">
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                const newPrompts = [...testPrompts];
                newPrompts[idx] = e.target.value;
                setTestPrompts(newPrompts);
              }}
            />
            <button
              onClick={() =>
                setTestPrompts(testPrompts.filter((_, i) => i !== idx))
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => setTestPrompts([...testPrompts, ''])}>
          Add Prompt
        </button>

        <button onClick={handleCompare} className="compare-btn">
          Run Comparison
        </button>
      </div>
    </div>
  );
}

/**
 * Versioning Tab - Manage clone versions
 */
function VersioningTab({
  groupId,
  creatorId,
}: {
  groupId: Id<'groups'>;
  creatorId: Id<'people'>;
}) {
  const [selectedClone, setSelectedClone] = useState<Id<'things'> | null>(
    null
  );
  const [versionName, setVersionName] = useState('');
  const [changes, setChanges] = useState('');

  const createVersion = useMutation(
    api.mutations['clone-orchestration'].createCloneVersion
  );

  const handleCreateVersion = async () => {
    if (!selectedClone || !versionName) {
      alert('Please select a clone and enter a version name');
      return;
    }

    try {
      const result = await createVersion({
        cloneId: selectedClone,
        versionName,
        changes,
      });

      console.log('Version created:', result);
      alert(`Version ${versionName} created!`);
      setVersionName('');
      setChanges('');
    } catch (error) {
      console.error('Version creation failed:', error);
      alert(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="versioning-tab">
      <h2>Clone Versioning</h2>
      <p>Create snapshots and rollback to previous versions</p>

      <div className="version-config">
        <h3>Create Version Snapshot</h3>

        {/* Clone selection would go here */}
        <div className="clone-selection">
          <p>
            <em>Clone selection UI - connect to listClones query</em>
          </p>
        </div>

        <div className="version-form">
          <label>
            Version Name
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="v1.2.0"
            />
          </label>

          <label>
            Changes Description
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Describe what changed in this version..."
              rows={3}
            />
          </label>

          <button onClick={handleCreateVersion} className="create-version-btn">
            Create Version Snapshot
          </button>
        </div>

        <div className="version-history">
          <h3>Version History</h3>
          <p className="hint">Previous versions will appear here</p>
          {/* Version list would go here */}
        </div>
      </div>
    </div>
  );
}
