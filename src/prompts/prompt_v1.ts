import { Messages } from "../../Interface/llm";

export function generateATSAnalysisPrompt(params: Messages): string {
    return `
  You are a senior ATS analyst. Analyze ${params.company_name || 'target company'}'s 
  ${params.job_title} position against the resume using this workflow:
  
  1. Core Verification
  2. Skill Matching
  3. Gap Identification
  4. Validation of scores in number format and type of integer
  JSON Structure:
  {
    "metadata": {
      "job_title_analysis": {
        "resume_titles": ["extracted from resume"], 
        "target_title": "${params.job_title}",
        "similarity_score": "number"
      },
      "source_validation": {
        "resume_sections_used": ["Experience", "Skills"],
        "external_sources": ["LinkedIn", "Company Website"]
      }
    },
    "score_breakdown": {
      "ats_score": "number",
      "components": {
        "keywords": "number%",
        "experience": "number",
        "education": "number",
        "culture_fit": "number"
      }
    },
    "gap_analysis": {
      "skills": {
        "missing_hard": ["JD tech not in resume"],
        "missing_soft": ["JD phrases missing"],
        "partial_matches": ["similar but non-identical terms"]
      },
      "experience": {
        "years_diff": "number",
        "role_gaps": ["missing JD requirements"]
      }
    },
    "recommendations": {
      "priority_order": ["critical", "high", "medium"],
      "action_items": {
        "critical": ["exact JD keywords to add"],
        "high": ["industry expectations"],
        "medium": ["company-specific optimizations"]
      }
    },
    "verification_status": {
      "needs_clarification": ["unverified claims"],
      "sources_checked": ["resume", "external"]
    }
  }
  
  Rules:
  1. All scores 0-100 scale
  2. Use only JD/resume text analysis
  3. Mark unverifiable data as 'unconfirmed'
  4. Include exact text matches from both documents
  
  Output: Pure JSON following this structure exactly.`;
  }
  
  export function generateDeepResumeAnalysisPrompt(params: Messages): string {
    return `
  You are a master resume analyst. Conduct deep-dive analysis of:
  
  Job Description: """
  ${params.job_desc}
  """
  
  Resume Content: """
  ${params.resumeInfo}
  """
  
  Produce JSON with base structure from standard analysis plus these deep sections:
  
  {
    ... (include all base structure fields),
    "deep_analysis": {
      "keyword_breakdown": {
        "jd_keywords": ["${params.job_desc.split(' ').slice(0,10).join('","')}"],
        "resume_matches": {
          "exact": ["term", ...],
          "partial": ["similar term", ...],
          "missing": ["critical JD term", ...]
        },
        "density_analysis": {
          "ideal_range": "5-7% per key skill",
          "current_distribution": {"skill": "%"}
        }
      },
      "achievement_analysis": {
        "quantified": {
          "count": "number",
          "examples": ["Increased X by Y%", ...]
        },
        "weak_statements": [
          {
            "original": "exact resume text",
            "improved": "stronger version",
            "improvement_reason": "Added metric/action verb"
          }
        ]
      },
      "competitive_positioning": {
        "strengths": ["unique value props"],
        "differentiators": ["rare skill combinations"],
        "market_weaknesses": ["common gaps in industry"]
      },
      "optimization_strategies": {
        "immediate": [
          {
            "section": "Skills Summary",
            "action": "Add '${params.job_desc.split(' ')[0]}'",
            "example": "Before: 'Skills' | After: '${params.job_desc.split(' ')[0]} Skills'"
          }
        ],
        "long_term": [
          {
            "skill": "Missing JD technology",
            "resource": "Recommended certification/course"
          }
        ]
      }
    },
    "readability_analysis": {
      "ats_friendly_score": "number/10",
      "human_readability": {
        "grade_level": "number",
        "passive_voice": "%"
      }
    }
  }
  
  Additional Rules:
  1. Provide before/after examples for every recommendation
  2. Include 3-5 specific wording improvements
  3. Add market comparison data points
  4. Maintain all verification rules from standard analysis
  
  Output: Pure JSON following combined structure.`;
  }
// export function generateATSAnalysisPrompt(params: Messages): string {
//     return `
//     You are an expert Applicant Tracking System (ATS) and career analyst. Your job is to evaluate how well a candidate's resume matches a job description.
//   **Objective**: Analyze the resume against ${params.company_name}'s ${params.job_title} position requirements. 
//   Produce a JSON report with factual insights only. Verify unknown company/job details through external research before analysis.
  
//   **Input Context**:
//   - Company: ${params.company_name || '[Research Required]'}
//   - Position: ${params.job_title}
//   - Job Description: ${params.job_desc}
//   - Resume Content: ${params.resumeInfo}
//   ### IMPORTANT INSTRUCTIONS:
// - If you lack sufficient context to judge a skill/experience (e.g., company not mentioned in resume), say "Insufficient data".
// - Do NOT hallucinate data.
// - If needed, you can briefly fetch info from public domain (e.g., company profile or typical responsibilities for that job title) and mention it in the analysis.
//   **Strict Requirements**:
//   1. Research missing company details (tech stack, culture) via real sources
//   2. Cross-reference resume claims with job description requirements
//   3. Never assume unspecified details
//   4. Flag uncertainties in 'needs_clarification' section
  
//   **JSON Structure Requirements**:
//   {
//     "summary": {
//       "atsScore": "number (0-100)",
//       "strengthAreas": "string[]",
//       "criticalImprovements": "string[]"
//     },
//     "matched_skills": {
//       "hardSkills": { "matches": "string[]", "missing": "string[]" },
//       "softSkills": { "matches": "string[]", "missing": "string[]" },
//       "keywordAnalysis": { "matches": "string[]", "missing": "string[]" }
//     },
//     "experienceAnalysis": {
//       "yearsMatch": "boolean",
//       "relevanceScore": "number (0-10)",
//       "gapAnalysis": "string[]",
//       "achievementMatch": "string[]"
//     },
//     "educationAnalysis": {
//       "degreeMatch": "boolean",
//       "certificationGaps": "string[]",
//       "specializedTrainingMissing": "string[]"
//     },
//     "culturalFit": {
//       "valuesAlignment": "string[]",
//       "potentialConflicts": "string[]",
//       "companySpecificRequirements": "string[]"
//     },
//     "recommendations": {
//       "immediateImprovements": "string[]",
//       "longTermSuggestions": "string[]",
//       "companySpecificTailoring": "string[]"
//     },
//     "needsClarification": "string[]",
//     "sourceReferences": "string[]"
//   }
  
//   **Special Instructions**:
//   1. For company analysis: ${!params.job_desc.includes('tech stack') ? '[Research required: company tech stack]' : ''}
//   2. Verify resume claims: ${params.resumeInfo.includes('certifications') ? '' : '[No certifications listed]'}
//   3. Industry-specific requirements: Compare with ${params.job_title} role standards
//   4. Include specific job description phrases in keyword analysis
//   5. Flag any resume claims needing verification (employment dates, certifications)
  
//   **Output Requirement**: Strict JSON following above schema. No markdown. Ensure valid JSON syntax.
//   `;
//   }