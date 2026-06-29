/**
 * Sold-Out Stage Diagnostic V0 — form schema.
 *
 * This is the single source of truth for the diagnostic. Edit this file to
 * add / remove / reorder questions or sections. Everything downstream
 * (the stepper UI, validation, and the Google Sheets columns) is generated
 * from this data, so the form stays easy to evolve as we learn more.
 *
 * Core principle (per the dev directive): build the diagnostic broadly enough
 * to learn. It inspects MULTIPLE possible bottlenecks across a drop brand's
 * growth system (offer, attention, demand, launch, aftermath, operations) and
 * makes NO hardcoded assumption that pre-launch demand is the constraint. The
 * operator self-selects their constraint in Section 10, and the (editable)
 * scoring + Sold-Out Engine routing lives in the Apps Script next to the sheet.
 */

import type { DiagnosticSection, QuestionOption } from "./types";

// Reusable option sets ------------------------------------------------------

const DROP_REVENUE_RANGES: QuestionOption[] = [
  { value: "under_10k", label: "Under $10K" },
  { value: "10k_25k", label: "$10K – $25K" },
  { value: "25k_50k", label: "$25K – $50K" },
  { value: "50k_100k", label: "$50K – $100K" },
  { value: "100k_plus", label: "$100K+" },
];

const MONTHLY_REVENUE_RANGES: QuestionOption[] = [
  { value: "under_10k_mo", label: "Under $10K / month" },
  { value: "10k_30k_mo", label: "$10K – $30K / month" },
  { value: "30k_100k_mo", label: "$30K – $100K / month" },
  { value: "100k_plus_mo", label: "$100K+ / month" },
];

const GROSS_MARGIN_RANGES: QuestionOption[] = [
  { value: "under_40", label: "Under 40%" },
  { value: "40_60", label: "40% – 60%" },
  { value: "60_75", label: "60% – 75%" },
  { value: "75_plus", label: "75%+" },
  { value: "not_sure", label: "Not sure" },
];

const YES_NO_NOTSURE: QuestionOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

const CLARITY_SCALE: QuestionOption[] = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];

// The diagnostic ------------------------------------------------------------

export const DIAGNOSTIC_SECTIONS: DiagnosticSection[] = [
  {
    id: "brand_basics",
    step: "Section 01",
    title: "Brand basics",
    helper: "The essentials so we know who we're reviewing and how to reach you.",
    questions: [
      {
        id: "brand_name",
        label: "Brand name",
        type: "text",
        required: true,
        placeholder: "Your label",
        half: true,
      },
      {
        id: "contact_name",
        label: "Founder / contact name",
        type: "text",
        required: true,
        placeholder: "Your name",
        half: true,
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "you@yourbrand.com",
        helper: "Where we'll send your recommended next Sold-Out Engine if there's a fit.",
      },
      {
        id: "instagram",
        label: "Instagram handle",
        type: "text",
        placeholder: "@yourbrand",
        half: true,
      },
      {
        id: "website",
        label: "Website",
        type: "url",
        placeholder: "yourbrand.com",
        half: true,
      },
      {
        id: "country",
        label: "Country / location",
        type: "text",
        placeholder: "e.g. United States",
        half: true,
      },
      {
        id: "product_category",
        label: "Main product category",
        type: "select",
        half: true,
        options: [
          { value: "streetwear", label: "Streetwear" },
          { value: "womenswear", label: "Womenswear" },
          { value: "menswear", label: "Menswear" },
          { value: "footwear", label: "Footwear" },
          { value: "accessories", label: "Accessories" },
          { value: "jewelry", label: "Jewelry" },
          { value: "beauty", label: "Beauty" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "leadership",
        label: "How is the brand run?",
        type: "select",
        options: [
          { value: "founder_led", label: "Founder-led" },
          { value: "creator_led", label: "Creator-led" },
          { value: "team_led", label: "Team-led" },
        ],
      },
    ],
  },

  {
    id: "audience_channels",
    step: "Section 02",
    title: "Audience & channels",
    helper: "Where your reach lives right now. Estimates are fine.",
    questions: [
      {
        id: "ig_followers",
        label: "Instagram follower count",
        type: "number",
        placeholder: "0",
        half: true,
      },
      {
        id: "tiktok_followers",
        label: "TikTok follower count",
        type: "number",
        placeholder: "0",
        half: true,
      },
      {
        id: "email_list_size",
        label: "Email list size",
        type: "number",
        placeholder: "0",
        half: true,
      },
      {
        id: "sms_list_size",
        label: "SMS list size",
        type: "number",
        placeholder: "0",
        half: true,
      },
      {
        id: "community_size",
        label: "Waitlist / VIP / community size",
        type: "number",
        placeholder: "0",
        helper: "Anyone you can reach directly (Discord, Geneva, close friends, etc.).",
      },
      {
        id: "main_traffic_source",
        label: "Main traffic source right now",
        type: "select",
        options: [
          { value: "organic_social", label: "Organic social" },
          { value: "paid_ads", label: "Paid ads" },
          { value: "email_sms", label: "Email / SMS" },
          { value: "influencers", label: "Influencers / creators" },
          { value: "wholesale", label: "Wholesale" },
          { value: "popups_events", label: "Pop-ups / events" },
          { value: "other", label: "Other" },
        ],
      },
    ],
  },

  {
    id: "revenue_stage",
    step: "Section 03",
    title: "Revenue stage",
    helper: "Where the business is today and where the next drop is aimed.",
    questions: [
      {
        id: "monthly_revenue",
        label: "Approx. monthly revenue range",
        type: "select",
        required: true,
        options: MONTHLY_REVENUE_RANGES,
      },
      {
        id: "last_drop_revenue",
        label: "Last drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        half: true,
      },
      {
        id: "best_drop_revenue",
        label: "Best drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        half: true,
      },
      {
        id: "next_drop_goal",
        label: "Next drop revenue goal",
        type: "currency",
        placeholder: "0",
        half: true,
      },
      {
        id: "drop_frequency",
        label: "Drop frequency",
        type: "select",
        half: true,
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "every_2_months", label: "Every 2 months" },
          { value: "quarterly", label: "Quarterly" },
          { value: "seasonal", label: "Seasonal" },
          { value: "random", label: "Random" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "num_drops",
        label: "Number of drops launched so far",
        type: "number",
        placeholder: "0",
      },
    ],
  },

  {
    id: "drop_economics",
    step: "Section 04",
    title: "Drop economics",
    helper: "The math, not just the vibes. Skip anything you don't track.",
    questions: [
      {
        id: "aov",
        label: "Average order value",
        type: "currency",
        placeholder: "0",
        helper: "If known.",
        half: true,
      },
      {
        id: "hero_price",
        label: "Hero / main product price",
        type: "currency",
        placeholder: "0",
        half: true,
      },
      {
        id: "units_last_drop",
        label: "Units released in last drop",
        type: "number",
        placeholder: "0",
        helper: "If known.",
        half: true,
      },
      {
        id: "sell_through",
        label: "Sell-through percentage",
        type: "percent",
        placeholder: "0",
        helper: "If known.",
        half: true,
      },
      {
        id: "gross_margin",
        label: "Gross margin range",
        type: "select",
        options: GROSS_MARGIN_RANGES,
        half: true,
      },
      {
        id: "discount_frequency",
        label: "Do you usually discount?",
        type: "select",
        half: true,
        options: [
          { value: "never", label: "Never" },
          { value: "sometimes", label: "Sometimes" },
          { value: "often", label: "Often" },
        ],
      },
      {
        id: "return_rate",
        label: "Return rate",
        type: "percent",
        placeholder: "0",
        helper: "If known.",
        half: true,
      },
      {
        id: "runs_paid_ads",
        label: "Do you run paid ads?",
        type: "yesno",
        half: true,
      },
      {
        id: "knows_cac_roas",
        label: "Do you know your CAC / ROAS?",
        type: "yesno",
        showIf: { id: "runs_paid_ads", equals: "Yes" },
      },
      {
        id: "drops_profitable",
        label:
          "Are your drops profitable after product, shipping, fulfillment, and marketing?",
        type: "select",
        options: YES_NO_NOTSURE,
      },
    ],
  },

  {
    id: "offer_strength",
    step: "Section 05",
    title: "Offer & product strength",
    helper:
      "A drop should sell a clear, differentiated offer — not just \"the store.\"",
    questions: [
      {
        id: "hero_product",
        label: "What is the hero product / main piece in your next drop?",
        type: "text",
        placeholder: "The piece everything centers on",
      },
      {
        id: "drop_structure",
        label: "Your next drop is built around…",
        type: "select",
        options: [
          { value: "one_hero", label: "One hero product" },
          { value: "small_capsule", label: "A small capsule" },
          { value: "large_collection", label: "A large collection" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "hero_difference",
        label: "What makes the hero product / drop different?",
        type: "textarea",
        placeholder: "The X-factor — why this, why now",
      },
      {
        id: "clear_reason_to_buy",
        label:
          "Is there a clear reason to buy this instead of similar alternatives?",
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "somewhat", label: "Somewhat" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "checkout_above_50",
        label: "Is the expected checkout value above $50?",
        type: "select",
        options: YES_NO_NOTSURE,
        half: true,
      },
      {
        id: "items_per_order",
        label: "Do customers usually buy one item or multiple?",
        type: "select",
        half: true,
        options: [
          { value: "one_item", label: "One item" },
          { value: "multiple_items", label: "Multiple items" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
    ],
  },

  {
    id: "attention_clarity",
    step: "Section 06",
    title: "Attention & creative clarity",
    helper:
      "The 5-second test: can a new person quickly grasp what it is, why it's special, and who it's for?",
    questions: [
      {
        id: "understand_what_5s",
        label: "Can a new person understand WHAT the product is in 5 seconds?",
        type: "select",
        options: CLARITY_SCALE,
      },
      {
        id: "understand_why_5s",
        label: "Can they understand WHY it's special in 5 seconds?",
        type: "select",
        options: CLARITY_SCALE,
      },
      {
        id: "understand_who_5s",
        label: "Can they understand WHO it's for in 5 seconds?",
        type: "select",
        options: CLARITY_SCALE,
      },
      {
        id: "launch_posts_communicate",
        label: "Your launch posts mostly communicate…",
        type: "select",
        options: [
          { value: "product_clarity", label: "Product clarity" },
          { value: "brand_mood", label: "Brand mood / aesthetic" },
          { value: "founder_story", label: "Founder story" },
          { value: "discounts", label: "Discounts / incentives" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "best_posts_best_converting",
        label: "Are your best-performing posts also your best-converting posts?",
        type: "select",
        options: YES_NO_NOTSURE,
      },
    ],
  },

  {
    id: "demand_audience",
    step: "Section 07",
    title: "Demand & owned audience",
    helper:
      "One possible bottleneck — not the only one. How much warm demand you build before drop day.",
    questions: [
      {
        id: "has_waitlist",
        label: "Do you have a pre-launch waitlist / \"get notified\" page?",
        type: "yesno",
        half: true,
      },
      {
        id: "collects_email_predrop",
        label: "Do you collect email before drop day?",
        type: "yesno",
        half: true,
      },
      {
        id: "collects_sms_predrop",
        label: "Do you collect SMS before drop day?",
        type: "yesno",
        half: true,
      },
      {
        id: "has_vip_list",
        label: "Do you have a VIP / early-access list?",
        type: "yesno",
        half: true,
      },
      {
        id: "knows_warm_buyers_needed",
        label: "Do you know how many warm buyers you need before launch day?",
        type: "yesno",
        half: true,
      },
      {
        id: "relies_on_social",
        label: "Do you mostly rely on IG/TikTok posting to drive drop sales?",
        type: "yesno",
        half: true,
      },
      {
        id: "has_launch_sequence",
        label: "Do you have a launch email / SMS sequence?",
        type: "yesno",
      },
    ],
  },

  {
    id: "launch_execution",
    step: "Section 08",
    title: "Launch execution",
    helper: "How drop day actually runs.",
    questions: [
      {
        id: "next_drop_date",
        label: "Next drop date",
        type: "date",
        half: true,
      },
      {
        id: "announces_exact_time",
        label: "Do you announce an exact drop time?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_countdowns",
        label: "Do you use countdowns / reminders?",
        type: "yesno",
        half: true,
      },
      {
        id: "sends_reminders",
        label: "Do you send reminders at 48h / 24h / 3h / live?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_early_access",
        label: "Do you use early access?",
        type: "yesno",
        half: true,
      },
      {
        id: "shows_live_proof",
        label: "Do you show live proof / stock updates during launch?",
        type: "yesno",
        half: true,
      },
      {
        id: "launch_feel",
        label: "Does launch day feel planned or chaotic?",
        type: "select",
        options: [
          { value: "planned", label: "Planned" },
          { value: "somewhat_planned", label: "Somewhat planned" },
          { value: "chaotic", label: "Chaotic" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
    ],
  },

  {
    id: "retention_aftermath",
    step: "Section 09",
    title: "Retention & aftermath",
    helper: "What happens after the drop ends.",
    questions: [
      {
        id: "captures_missed",
        label: "After a drop, do you capture people who missed it?",
        type: "yesno",
        half: true,
      },
      {
        id: "collects_ugc",
        label: "Do you collect UGC / unboxing / reviews?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_soldout_proof",
        label: "Do you use sold-out proof in the next campaign?",
        type: "yesno",
        half: true,
      },
      {
        id: "customers_repeat",
        label: "Do customers repeat-buy across drops?",
        type: "yesno",
        half: true,
      },
      {
        id: "knows_repeat_rate",
        label: "Do you know your repeat customer rate?",
        type: "yesno",
        half: true,
      },
      {
        id: "post_drop_review",
        label: "Do you have a post-drop review process?",
        type: "yesno",
        half: true,
      },
    ],
  },

  {
    id: "operating_maturity",
    step: "Section 10",
    title: "Operating maturity",
    helper: "Are you operating by system, or by trial-and-error?",
    questions: [
      {
        id: "repeatable_process",
        label: "Do you have a repeatable drop process?",
        type: "yesno",
        half: true,
      },
      {
        id: "reviews_numbers",
        label: "Do you review numbers after each drop?",
        type: "yesno",
        half: true,
      },
      {
        id: "documents_learnings",
        label: "Do you document what worked and what failed?",
        type: "yesno",
        half: true,
      },
      {
        id: "team_structure",
        label: "Who's running things right now?",
        type: "select",
        half: true,
        options: [
          { value: "just_me", label: "Just me" },
          { value: "internal_team", label: "Internal team" },
          { value: "freelancers", label: "Freelancers" },
          { value: "agency", label: "Agency" },
          { value: "mix", label: "A mix" },
        ],
      },
      {
        id: "bottleneck",
        label: "What feels like the biggest constraint right now?",
        type: "select",
        required: true,
        options: [
          { value: "offer_unclear", label: "Product / offer is not clear enough" },
          { value: "not_special", label: "People don't understand why the product is special" },
          { value: "not_enough_ready", label: "Not enough people are ready to buy before launch" },
          { value: "too_dependent_social", label: "Too dependent on Instagram / TikTok reach" },
          { value: "aov_too_low", label: "AOV is too low" },
          { value: "margins_tight", label: "Margins are too tight" },
          { value: "launch_chaotic", label: "Launch day is chaotic" },
          { value: "inconsistent_drops", label: "Drops are inconsistent" },
          { value: "low_repeat", label: "We get buyers but not enough repeat customers" },
          { value: "ads_not_profitable", label: "Paid ads are not profitable" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
    ],
  },
];
