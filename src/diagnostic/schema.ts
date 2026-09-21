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
 *
 * Copy guidelines (from founder feedback):
 *   - `helper` = one short line under the field.
 *   - `info`   = a plain-English explanation behind the (i) icon, for anyone
 *                who doesn't know the term (AOV, sell-through, warm buyers…).
 *   - `multiselect` where founders shouldn't have to second-guess one pick.
 *   - Yes / Sometimes / No where a hard yes/no felt wrong.
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

/**
 * Softer yes/no for habits that aren't all-or-nothing. Values keep the same
 * "Yes" / "No" capitalisation as the default yesno options so nothing
 * downstream (showIf, scoring) needs to change.
 */
const YES_SOMETIMES_NO: QuestionOption[] = [
  { value: "Yes", label: "Yes" },
  { value: "Sometimes", label: "Sometimes" },
  { value: "No", label: "No" },
];

const CLARITY_SCALE: QuestionOption[] = [
  { value: "yes", label: "Yes" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];

const PICK_ALL = "Pick all that apply.";

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
        type: "multiselect",
        half: true,
        helper: PICK_ALL,
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
        info:
          "Founder-led: the founder is the face and makes the calls. Creator-led: an influencer / creator fronts the brand. Team-led: a team runs it day to day without one public face.",
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
        info:
          "How many email addresses you can send a launch email to today (e.g. your Klaviyo / Mailchimp / Shopify Email list). A rough number is fine.",
      },
      {
        id: "sms_list_size",
        label: "SMS list size",
        type: "number",
        placeholder: "0",
        half: true,
        info:
          "How many phone numbers have opted in to get texts from you (e.g. Postscript, Attentive, Klaviyo SMS). Put 0 if you don't collect SMS.",
      },
      {
        id: "community_size",
        label: "Waitlist / VIP / community size",
        type: "number",
        placeholder: "0",
        helper: "Anyone you can reach directly (Discord, Geneva, close friends, etc.).",
        info:
          "People who have raised their hand for your brand outside of social feeds: a waitlist, a VIP / early-access list, a Discord or WhatsApp group, a Close Friends list. If someone is on both email and a waitlist, counting them twice is fine for now.",
      },
      {
        id: "main_traffic_source",
        label: "Main traffic source right now",
        type: "multiselect",
        helper: PICK_ALL,
        info:
          "Where most of the people who visit your store actually come from. If you're not sure, pick where you put most of your effort.",
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
        info:
          "Your average sales per month over the last few months, before costs. If your income is mostly from drops, spread the last few drops across the months in between.",
        options: MONTHLY_REVENUE_RANGES,
      },
      {
        id: "monthly_revenue_avg",
        label: "Average monthly revenue (exact, if you know it)",
        type: "currency",
        placeholder: "0",
        helper:
          "Optional — type your average if the ranges above feel too rough. We'll use this number over the range.",
      },
      {
        id: "last_drop_revenue",
        label: "Last drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        half: true,
        info: "Total sales from your most recent drop / launch, before costs.",
      },
      {
        id: "best_drop_revenue",
        label: "Best drop revenue range",
        type: "select",
        options: DROP_REVENUE_RANGES,
        half: true,
        info: "Total sales from your single best drop so far, before costs.",
      },
      {
        id: "next_drop_goal",
        label: "Next drop revenue goal",
        type: "currency",
        placeholder: "0",
        half: true,
        info:
          "What you want the next drop to make in total sales. A number you'd be happy with, not a moonshot — it's used to size your revenue gap.",
      },
      {
        id: "drop_frequency",
        label: "Drop frequency",
        type: "select",
        half: true,
        info:
          "How often you release something new. Seasonal = tied to seasons / the fashion calendar. Random = whenever product is ready.",
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
        info:
          "Count every launch where you released new product on a set date — capsules, restocks with a launch moment, collabs. A rough count is fine.",
      },
    ],
  },

  {
    id: "drop_economics",
    step: "Section 04",
    title: "Drop economics",
    helper:
      "The math, not just the vibes. Skip anything you don't track — tap the (i) if a term is new.",
    questions: [
      {
        id: "aov",
        label: "Average order value",
        type: "currency",
        placeholder: "0",
        helper: "If known.",
        half: true,
        info:
          "AOV = how much one customer spends per order, on average. Total sales ÷ number of orders. Shopify shows it on the home dashboard as \"Average order value\".",
      },
      {
        id: "hero_price",
        label: "Hero / main product price",
        type: "currency",
        placeholder: "0",
        half: true,
        info:
          "The price of the one product your drop is built around — the piece you'd put in the first post. If a drop has several pieces, use the one you expect to sell the most of.",
      },
      {
        id: "units_last_drop",
        label: "Units released in last drop",
        type: "number",
        placeholder: "0",
        helper: "If known.",
        half: true,
        info:
          "How many individual items you made available in your last drop (all sizes and colours added up).",
      },
      {
        id: "sell_through",
        label: "Sell-through percentage",
        type: "percent",
        placeholder: "0",
        helper: "If known.",
        half: true,
        info:
          "Sell-through = the share of what you released that actually sold. Units sold ÷ units released × 100. Released 200 pieces and sold 150? That's 75%.",
      },
      {
        id: "gross_margin",
        label: "Gross margin range",
        type: "select",
        options: GROSS_MARGIN_RANGES,
        half: true,
        info:
          "Gross margin = what's left of the price after the cost of making the product. (Price − cost to make) ÷ price × 100. A $100 hoodie that costs $40 to make has a 60% gross margin. Shipping and ads are not included here.",
      },
      {
        id: "discount_frequency",
        label: "Do you usually discount?",
        type: "select",
        half: true,
        info:
          "Do you rely on sales, promo codes, or launch discounts to move product? \"Often\" = most drops or most months have a discount running.",
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
        info:
          "Return rate = the share of orders that get sent back. Orders returned ÷ orders shipped × 100. For fashion, 10–20% is common; put 0 if you don't accept returns.",
      },
      {
        id: "runs_paid_ads",
        label: "Do you run paid ads?",
        type: "yesno",
        half: true,
        info:
          "Paid ads = money spent on Meta (Instagram / Facebook), TikTok, Google, or paid creator posts to drive traffic. Boosting a post counts.",
      },
      {
        id: "knows_cac_roas",
        label: "Do you know your CAC / ROAS?",
        type: "yesno",
        showIf: { id: "runs_paid_ads", equals: "Yes" },
        info:
          "CAC = customer acquisition cost: how much you spend on ads to win one new customer. ROAS = return on ad spend: sales ÷ ad spend (a ROAS of 3 means $3 in sales for every $1 of ads).",
      },
      {
        id: "drops_profitable",
        label:
          "Are your drops profitable after product, shipping, fulfillment, and marketing?",
        type: "select",
        options: YES_NO_NOTSURE,
        info:
          "After you subtract the cost of making the product, shipping it, packing / fulfilment fees, and any marketing or ad spend for that drop — is there money left over?",
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
        info:
          "The hero product is the single piece the drop is built around — the one you'd put in the first post, the one people are waiting for. If you're not sure yet, name the piece you'd expect to sell out first.",
      },
      {
        id: "drop_structure",
        label: "Your next drop is built around…",
        type: "select",
        info:
          "One hero product = a single piece (maybe in a few colours). Small capsule = roughly 3–8 pieces that go together. Large collection = a full range of 10+ pieces.",
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
        info:
          "In one or two sentences: why would someone buy this instead of a similar piece from another brand? Fabric, fit, story, scarcity, price, a collab — whatever the real reason is.",
      },
      {
        id: "clear_reason_to_buy",
        label:
          "Is there a clear reason to buy this instead of similar alternatives?",
        type: "select",
        info:
          "Imagine a shopper comparing your piece to two similar ones from other brands. Can they say in one sentence why yours is the one to get?",
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
        info:
          "Expected checkout value = what one customer typically spends in a single order at checkout, including multiple items. It's roughly your average order value — if most orders are one $45 tee, the answer is No; if people usually add a second piece, it's likely Yes.",
      },
      {
        id: "items_per_order",
        label: "Do customers usually buy one item or multiple?",
        type: "select",
        half: true,
        info:
          "Think about a typical order: one piece, or do people tend to bundle (tee + hat, two colourways)?",
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
        info:
          "Show your launch post or product page to someone who has never seen your brand. Within 5 seconds, can they say what the item is (a jacket, a ring, a set)?",
        options: CLARITY_SCALE,
      },
      {
        id: "understand_why_5s",
        label: "Can they understand WHY it's special in 5 seconds?",
        type: "select",
        info:
          "Same 5-second test: can they say what makes it different — the material, the fit, the story, the limited run?",
        options: CLARITY_SCALE,
      },
      {
        id: "understand_who_5s",
        label: "Can they understand WHO it's for in 5 seconds?",
        type: "select",
        info:
          "Can they tell who this is made for — the person, the style, the scene — without you explaining it?",
        options: CLARITY_SCALE,
      },
      {
        id: "launch_posts_communicate",
        label: "Your launch posts mostly communicate…",
        type: "multiselect",
        helper: PICK_ALL,
        info:
          "Look at your last few launch posts. Product clarity = the item itself, clearly shown. Brand mood = vibe, lifestyle, aesthetic. Founder story = you and the why. Discounts = codes, sales, incentives.",
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
        info:
          "Best-performing = most views, likes, shares. Best-converting = the posts that actually lead to sales (check Shopify's traffic sources or your link-in-bio clicks). They're often not the same post.",
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
        info:
          "A page or form where people can leave their email or number to be told when the drop goes live — before it's on sale.",
      },
      {
        id: "collects_email_predrop",
        label: "Do you collect email before drop day?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Do you actively ask for email addresses in the weeks before a drop (pop-up, waitlist, link in bio), rather than only at checkout?",
      },
      {
        id: "collects_sms_predrop",
        label: "Do you collect SMS before drop day?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Same as email, but phone numbers for text alerts. Text messages get opened far faster than email on launch day.",
      },
      {
        id: "has_vip_list",
        label: "Do you have a VIP / early-access list?",
        type: "yesno",
        half: true,
        info:
          "A smaller group of your best customers or fans who get to shop before everyone else (early link, password page, Close Friends story).",
      },
      {
        id: "knows_warm_buyers_needed",
        label: "Do you know how many warm buyers you need before launch day?",
        type: "yesno",
        half: true,
        info:
          "Warm buyers = people who have already said they want the drop (on the waitlist, replied to a story, asked when it's out). Knowing the number means you've worked out roughly how many of them you need signed up to hit your revenue goal.",
      },
      {
        id: "relies_on_social",
        label: "Do you mostly rely on IG/TikTok posting to drive drop sales?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Is launch day mostly \"post and hope the algorithm shows it\"? Yes = if the post flops, the drop flops. No = you also reach people directly (email, SMS, DMs, VIP list).",
      },
      {
        id: "has_launch_sequence",
        label: "Do you have a launch email / SMS sequence?",
        type: "yesno",
        info:
          "A launch sequence is a pre-written set of emails / texts that go out around the drop — e.g. a teaser a week before, a reminder the day before, a \"we're live\" message, and a \"last chance\" message. If you write one email on launch morning, that's a No for now.",
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
        info: "Best guess is fine — it helps us see how much runway you have.",
      },
      {
        id: "announces_exact_time",
        label: "Do you announce an exact drop time?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "E.g. \"Friday 12pm EST\", not just \"this week\". An exact time lets people plan to show up.",
      },
      {
        id: "uses_countdowns",
        label: "Do you use countdowns / reminders?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Countdown stickers on stories, a timer on the site, or scheduled reminder posts in the days before.",
      },
      {
        id: "sends_reminders",
        label: "Do you send reminders at 48h / 24h / 3h / live?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "A short run of nudges to your list as the drop gets close: two days out, the day before, a few hours before, and the moment it goes live.",
      },
      {
        id: "uses_early_access",
        label: "Do you use early access?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Letting a smaller group (VIPs, waitlist, SMS subscribers) shop before the public link goes out.",
      },
      {
        id: "shows_live_proof",
        label: "Do you show live proof / stock updates during launch?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "During the drop, posting things like \"50% gone in 20 minutes\", \"M sold out\", or screenshots of orders. It shows people that others are buying right now.",
      },
      {
        id: "launch_feel",
        label: "Does launch day feel planned or chaotic?",
        type: "select",
        info:
          "Planned = you know what goes out, when, and who does it. Chaotic = you're making posts, fixing the site, and answering DMs on the fly.",
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
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "When something sells out, do you give latecomers a way to sign up (\"notify me\", restock waitlist) instead of just a sold-out page?",
      },
      {
        id: "collects_ugc",
        label: "Do you collect UGC / unboxing / reviews?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "UGC = user-generated content: photos, videos, unboxings, and reviews made by customers that you can repost or use in the next launch.",
      },
      {
        id: "uses_soldout_proof",
        label: "Do you use sold-out proof in the next campaign?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Reusing the fact that the last drop sold out (\"gone in 40 minutes\", \"200 on the restock list\") in the marketing for the next one.",
      },
      {
        id: "customers_repeat",
        label: "Do customers repeat-buy across drops?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Do the same people come back and buy from the next drop, or is each drop mostly new customers?",
      },
      {
        id: "knows_repeat_rate",
        label: "Do you know your repeat customer rate?",
        type: "yesno",
        half: true,
        info:
          "Repeat customer rate = the share of customers who have bought more than once. Shopify shows it under Analytics → \"Returning customer rate\".",
      },
      {
        id: "post_drop_review",
        label: "Do you have a post-drop review process?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "A set moment after each drop where you look at the numbers (sales, sell-through, best sellers, what flopped) and write down what to change next time.",
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
        info:
          "A checklist or timeline you follow for every drop (teaser → waitlist → reminders → launch → follow-up), rather than starting from scratch each time.",
      },
      {
        id: "reviews_numbers",
        label: "Do you review numbers after each drop?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Looking at revenue, units sold, sell-through, and where buyers came from once the drop ends.",
      },
      {
        id: "documents_learnings",
        label: "Do you document what worked and what failed?",
        type: "yesno",
        options: YES_SOMETIMES_NO,
        half: true,
        info:
          "Writing it down somewhere (Notes, a doc, a spreadsheet) so the next drop starts from what you learned.",
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
        type: "multiselect",
        required: true,
        helper: "Pick all that apply — your first pick is treated as the main one.",
        info:
          "Your honest read on what's holding the next drop back. There's no wrong answer — this is the starting point for the review, not the verdict.",
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
