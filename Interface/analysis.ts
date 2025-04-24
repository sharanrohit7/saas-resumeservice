export interface BaseAnalysis {
    metadata: {
      job_title_analysis: {
        resume_titles: string[];
        target_title: string;
        similarity_score: number;
      };
      source_validation: {
        resume_sections_used: string[];
        external_sources: string[];
      };
    };
    score_breakdown: {
      ats_score: number;
      components: {
        keywords: number;
        experience: number;
        education: number;
        culture_fit: number;
      };
    };
    gap_analysis: {
      skills: {
        missing_hard: string[];
        missing_soft: string[];
        partial_matches: string[];
      };
      experience: {
        years_diff: number;
        role_gaps: string[];
      };
    };
    recommendations: {
      priority_order: string[];
      action_items: {
        critical: string[];
        high: string[];
        medium: string[];
      };
    };
    verification_status: {
      needs_clarification: string[];
      sources_checked: string[];
    };
  }
  
  export interface DeepAnalysis extends BaseAnalysis {
    deep_analysis: {
      keyword_breakdown: {
        jd_keywords: string[];
        resume_matches: {
          exact: string[];
          partial: string[];
          missing: string[];
        };
        density_analysis: {
          ideal_range: string;
          current_distribution: Record<string, number>;
        };
      };
      achievement_analysis: {
        quantified: {
          count: number;
          examples: string[];
        };
        weak_statements: Array<{
          original: string;
          improved: string;
          improvement_reason: string;
        }>;
      };
      competitive_positioning: {
        strengths: string[];
        differentiators: string[];
        market_weaknesses: string[];
      };
      optimization_strategies: {
        immediate: Array<{
          section: string;
          action: string;
          example: string;
        }>;
        long_term: Array<{
          skill: string;
          resource: string;
        }>;
      };
    };
    readability_analysis: {
      ats_friendly_score: number;
      human_readability: {
        grade_level: number;
        passive_voice: number;
      };
    };
  }
  