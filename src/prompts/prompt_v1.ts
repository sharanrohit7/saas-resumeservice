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
  
  **Output Requirement**: Strict JSON following above schema. No markdown. Ensure valid JSON syntax.`;
  }
  
  export function generateDeepResumeAnalysisPrompt(params: Messages): string {
    const jdWordsArray = params.job_desc
      .replace(/[\n\r]/g, ' ')
      .replace(/["]/g, "'")
      .split(/\s+/)
      .slice(0, 10);
  
    const jdWords = jdWordsArray.map(word => `"${word}"`).join(',');
  
    return `
  You are a master resume analyst and ATS expert.
  
  Compare this resume and job description in detail. Your output must follow this **strict JSON** structure with valid syntax, no markdown, no explanation.
  
  Job Title: "${params.job_title}"
  Company: "${params.company_name}"
  Resume Content: """${params.resumeInfo}"""
  
  Return JSON in this format:
  
  {
    "metadata": {
      "job_title_analysis": {
        "resume_titles": ["Software Engineer", "Backend Developer"], 
        "target_title": "${params.job_title}",
        "similarity_score": 78
      },
      "source_validation": {
        "resume_sections_used": ["Experience", "Skills"],
        "external_sources": ["LinkedIn", "Company Website"]
      }
    },
    "score_breakdown": {
      "ats_score": 82,
      "components": {
        "keywords": 85,
        "experience": 78,
        "education": 80,
        "culture_fit": 65
      }
    },
    "gap_analysis": {
      "skills": {
        "missing_hard": ["Kubernetes", "AWS"],
        "missing_soft": ["problem-solving", "cross-functional collaboration"],
        "partial_matches": ["REST API vs RESTful services"]
      },
      "experience": {
        "years_diff": 2,
        "role_gaps": ["team leadership", "CI/CD setup"]
      }
    },
    "recommendations": {
      "priority_order": ["critical", "high", "medium"],
      "action_items": {
        "critical": ["Add 'Kubernetes' and 'AWS' in Skills and Projects"],
        "high": ["Highlight team leadership experience"],
        "medium": ["Align job title with JD"]
      }
    },
    "verification_status": {
      "needs_clarification": ["Managed large teams – no size specified"],
      "sources_checked": ["resume", "external"]
    },
    "deep_analysis": {
      "keyword_breakdown": {
        "jd_keywords": [${jdWords}],
        "resume_matches": {
          "exact": ["Java", "Springboot"],
          "partial": ["REST APIs"],
          "missing": ["AWS", "Kubernetes"]
        },
        "density_analysis": {
          "ideal_range": "5-7%",
          "current_distribution": {
            "Java": "6%",
            "Springboot": "4%",
            "Kubernetes": "0%"
          }
        }
      },
      "achievement_analysis": {
        "quantified": {
          "count": 3,
          "examples": ["Increased API throughput by 40%", "Reduced downtime by 30%"]
        },
        "weak_statements": [
          {
            "original": "Handled deployment",
            "improved": "Led deployment pipelines reducing manual steps by 50%",
            "improvement_reason": "Added metric and leadership context"
          }
        ]
      },
      "competitive_positioning": {
        "strengths": ["Full-stack exposure", "Startup adaptability"],
        "differentiators": ["Go + React stack", "Fast delivery track record"],
        "market_weaknesses": ["No cloud certifications"]
      },
      "optimization_strategies": {
        "immediate": [
          {
            "section": "Skills",
            "action": "Add missing JD term",
            "example": "Before: 'Skills: Java, Spring' | After: 'Skills: Java, Spring, AWS'"
          }
        ],
        "long_term": [
          {
            "skill": "Kubernetes",
            "resource": "Certified Kubernetes Administrator (CKA)"
          }
        ]
      }
    },
    "readability_analysis": {
      "ats_friendly_score": 9,
      "human_readability": {
        "grade_level": 8,
        "passive_voice": "10%"
      }
    }
  }
  `;
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