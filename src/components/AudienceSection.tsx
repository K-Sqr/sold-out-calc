import type { CalculatorInputs } from "../types";
import { NumberField } from "./NumberField";
import { Section } from "./Section";

interface Props {
  inputs: CalculatorInputs;
  update: (patch: Partial<CalculatorInputs>) => void;
}

export function AudienceSection({ inputs, update }: Props) {
  return (
    <Section
      step="Step 03"
      title="Your audience context"
      helper="This helps compare your total audience to the people you can actually reach before launch."
      id="audience"
    >
      <NumberField
        label="How many followers do you have on your main platform?"
        value={inputs.followerCount}
        onChange={(n) => update({ followerCount: n })}
        placeholder="50,000"
        helper="Instagram, TikTok, YouTube, or wherever most of your drop attention comes from."
      />
    </Section>
  );
}
