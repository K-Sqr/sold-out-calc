/**
 * Sold-Out Stage Diagnostic V0 — form schema.
 *
 * This is the single source of truth for the diagnostic. Edit this file to
 * add / remove / reorder questions or sections. Everything downstream
 * (the stepper UI, validation, and the Google Sheets columns) is generated
 * from this data, so the form stays easy to evolve as we learn more.
 *
 * NOTE: There is intentionally NO hardcoded assumption that pre-launch demand
 * is the bottleneck. The operator self-selects their constraint in Section 06,
 * and the (editable) scoring lives in the Apps Script next to the sheet.
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
  { value: "40_55", label: "40% – 55%" },
  { value: "55_70", label: "55% – 70%" },
  { value: "70_plus", label: "70%+" },
  { value: "not_sure", label: "Not sure" },
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
        helper: "Where we'll send your recommended next module if there's a fit.",
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
        id: "product_category",
        label: "Main product category",
        type: "select",
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
        id: "country",
        label: "Country / location",
        type: "text",
        placeholder: "e.g. United States",
        half: true,
      },
    ],
  },

  {
    id: "audience_platform",
    step: "Section 02",
    title: "Audience & platform",
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
        helper: "If relevant.",
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
          { value: "influencer", label: "Influencer" },
          { value: "email_sms", label: "Email / SMS" },
          { value: "wholesale", label: "Wholesale" },
          { value: "other", label: "Other" },
        ],
      },
    ],
  },

  {
    id: "drop_history",
    step: "Section 03",
    title: "Drop history",
    helper: "What your drops have looked like so far. Skip anything you don't track.",
    questions: [
      {
        id: "has_launched",
        label: "Have you launched before?",
        type: "yesno",
        required: true,
      },
      {
        id: "num_drops",
        label: "Number of drops launched",
        type: "number",
        placeholder: "0",
        showIf: { id: "has_launched", equals: "Yes" },
        half: true,
      },
      {
        id: "drop_frequency",
        label: "Drop frequency",
        type: "select",
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "quarterly", label: "Quarterly" },
          { value: "seasonal", label: "Seasonal" },
          { value: "random", label: "Random" },
          { value: "other", label: "Other" },
        ],
        showIf: { id: "has_launched", equals: "Yes" },
      },
      {
        id: "last_drop_revenue",
        label: "Last drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        showIf: { id: "has_launched", equals: "Yes" },
      },
      {
        id: "best_drop_revenue",
        label: "Best drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        showIf: { id: "has_launched", equals: "Yes" },
      },
      {
        id: "aov",
        label: "Average order value",
        type: "currency",
        placeholder: "0",
        helper: "If known.",
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
        helper: "If known.",
      },
    ],
  },

  {
    id: "current_stage",
    step: "Section 04",
    title: "Current business stage",
    helper: "A quick snapshot of where the business is today.",
    questions: [
      {
        id: "monthly_revenue",
        label: "Approx. monthly revenue range",
        type: "select",
        required: true,
        options: MONTHLY_REVENUE_RANGES,
      },
      {
        id: "uses_shopify",
        label: "Do you currently use Shopify?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_klaviyo",
        label: "Do you currently use Klaviyo?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_email",
        label: "Do you use email marketing?",
        type: "yesno",
        half: true,
      },
      {
        id: "uses_sms",
        label: "Do you use SMS marketing?",
        type: "yesno",
        half: true,
      },
      {
        id: "runs_paid_ads",
        label: "Do you currently run paid ads?",
        type: "yesno",
      },
      {
        id: "paid_ads_platform",
        label: "Which platform?",
        type: "select",
        options: [
          { value: "meta", label: "Meta (Instagram / Facebook)" },
          { value: "tiktok", label: "TikTok" },
          { value: "google", label: "Google" },
          { value: "pinterest", label: "Pinterest" },
          { value: "other", label: "Other" },
        ],
        showIf: { id: "runs_paid_ads", equals: "Yes" },
      },
    ],
  },

  {
    id: "next_drop",
    step: "Section 05",
    title: "Next drop",
    helper: "What's coming up. This helps us understand your near-term goal.",
    questions: [
      {
        id: "next_drop_date",
        label: "Next drop date",
        type: "date",
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
        id: "next_product",
        label: "Main product / collection",
        type: "text",
        placeholder: "What you're dropping",
      },
      {
        id: "expected_aov",
        label: "Expected AOV",
        type: "currency",
        placeholder: "0",
        half: true,
      },
      {
        id: "inventory_qty",
        label: "Inventory quantity",
        type: "number",
        placeholder: "0",
        half: true,
      },
      {
        id: "launch_plan",
        label: "Current launch plan",
        type: "textarea",
        placeholder: "How are you planning to launch it right now?",
      },
      {
        id: "biggest_concern",
        label: "Biggest concern about the next drop",
        type: "textarea",
        placeholder: "What worries you most?",
      },
    ],
  },

  {
    id: "bottleneck",
    step: "Section 06",
    title: "Biggest constraint",
    helper: "What feels like the biggest thing holding the next level back right now?",
    questions: [
      {
        id: "bottleneck",
        label: "Biggest constraint right now",
        type: "select",
        required: true,
        options: [
          { value: "not_enough_buyers", label: "Not enough buyers ready before launch" },
          { value: "too_dependent_social", label: "Too dependent on Instagram / TikTok reach" },
          { value: "list_too_small", label: "Email / SMS list too small" },
          { value: "like_not_buy", label: "People like the brand but don't buy enough" },
          { value: "aov_too_low", label: "AOV is too low" },
          { value: "inconsistent_drops", label: "Drops are inconsistent" },
          { value: "low_sell_through", label: "Sell-through is too low" },
          { value: "ads_not_profitable", label: "Paid ads are not profitable" },
          { value: "low_retention", label: "We sell, but don't retain / repeat enough" },
          { value: "not_sure", label: "I'm not sure" },
        ],
      },
    ],
  },
];
