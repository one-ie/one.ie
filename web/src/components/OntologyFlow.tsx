import React from 'react';
import { ArrowRight, Box, Users, Share2, Zap, Brain, Lock } from 'lucide-react';

interface OntologyDimension {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  example: string;
}

const dimensions: OntologyDimension[] = [
  {
    id: 'groups',
    title: 'Groups',
    description: 'Hierarchical containers for multi-tenant isolation',
    color: 'from-blue-500 to-blue-600',
    icon: <Lock className="w-5 h-5" />,
    example: 'Organizations, teams, communities',
  },
  {
    id: 'people',
    title: 'People',
    description: 'Authorization and governance roles',
    color: 'from-purple-500 to-purple-600',
    icon: <Users className="w-5 h-5" />,
    example: 'Owners, members, customers',
  },
  {
    id: 'things',
    title: 'Things',
    description: '66+ entity types with flexible properties',
    color: 'from-green-500 to-green-600',
    icon: <Box className="w-5 h-5" />,
    example: 'Products, users, agents, tokens',
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Relationships with rich metadata',
    color: 'from-orange-500 to-orange-600',
    icon: <Share2 className="w-5 h-5" />,
    example: 'Owns, follows, purchased, enrolled',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Immutable action history and audit trail',
    color: 'from-red-500 to-red-600',
    icon: <Zap className="w-5 h-5" />,
    example: 'Created, purchased, viewed, completed',
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    description: 'Vectors, embeddings, and semantic search',
    color: 'from-cyan-500 to-cyan-600',
    icon: <Brain className="w-5 h-5" />,
    example: 'Search, recommendations, RAG',
  },
];

export function OntologyFlow() {
  return (
    <div className="w-full space-y-8">
      {/* Desktop Flow */}
      <div className="hidden md:block">
        <div className="grid grid-cols-6 gap-4 items-stretch">
          {dimensions.map((dim, idx) => (
            <React.Fragment key={dim.id}>
              <div
                className={`relative rounded-lg bg-gradient-to-br ${dim.color} p-4 text-white shadow-lg transform transition hover:scale-105`}
              >
                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">{dim.icon}</div>
                  <h3 className="font-semibold text-sm">{dim.title}</h3>
                  <p className="text-xs opacity-90">{dim.description}</p>
                  <div className="text-xs opacity-75 mt-2 italic">{dim.example}</div>
                </div>
              </div>
              {idx < dimensions.length - 1 && (
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Stack */}
      <div className="md:hidden space-y-4">
        {dimensions.map((dim, idx) => (
          <div key={dim.id} className="space-y-2">
            <div
              className={`rounded-lg bg-gradient-to-br ${dim.color} p-4 text-white shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  {dim.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{dim.title}</h3>
                  <p className="text-sm opacity-90">{dim.description}</p>
                  <p className="text-xs opacity-75 mt-2 italic">{dim.example}</p>
                </div>
              </div>
            </div>
            {idx < dimensions.length - 1 && (
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Principle */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Everything flows through these 6 dimensions.
          <br />
          Scales from friend circles to governments without schema changes.
        </p>
      </div>
    </div>
  );
}
