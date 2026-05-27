import type { CalculatorInputs } from "../types";
import { NumberField } from "./NumberField";
import { Section } from "./Section";

interface Props {
  inputs: CalculatorInputs;
  update: (patch: Partial<CalculatorInputs>) => void;
}

export function GoalSection({ inputs, update }: Props) {
  return (
    <Section
      step="Step 01"
      title="Your sold-out goal"
      helper="Start with your best estimate. You can always recalculate."
      id="goal"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumberField
          label="What do you want this drop to make?"
          value={inputs.revenueGoal}
          onChange={(n) => update({ revenueGoal: n })}
          placeholder="10,000"
          currency
        />
        <NumberField
          label="About how much does one customer usually spend?"
          value={inputs.averageOrderValue}
          onChange={(n) => update({ averageOrderValue: n })}
          placeholder="120"
          helper="If you're not sure, use your average product price."
          currency
        />
      </div>
    </Section>
  );
}
