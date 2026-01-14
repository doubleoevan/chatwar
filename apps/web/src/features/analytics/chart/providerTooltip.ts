import type {
  ChartType,
  TooltipCallbacks,
  TooltipItem,
  TooltipModel,
  TooltipOptions,
} from "chart.js";
import type { ProviderId } from "@chatwar/shared";
import { getProviderIcon } from "@/utils/providerIcon";

type PartialCallbacks<TType extends ChartType> = Partial<
  TooltipCallbacks<TType, TooltipModel<TType>, TooltipItem<TType>>
>;

export function getTooltip<TType extends ChartType>({
  isDark,
  getProviderId,
  options,
}: {
  isDark: boolean;
  getProviderId: (context: TooltipItem<TType>) => ProviderId;
  options?: TooltipOptions<TType>;
}): TooltipOptions<TType> {
  // set the tooltip colors based on the passed in theme
  const tooltipColors = isDark
    ? { background: "#020617", text: "#e5e7eb", border: "#e5e7eb" }
    : { background: "#ffffff", text: "#0f172a", border: "#0f172a" };

  // add the provider icon and label to the tooltip
  const tooltipCallbacks: PartialCallbacks<TType> = {
    label: (context) => `  ${context.raw} wins`,
    labelPointStyle: (context) => {
      const providerId = getProviderId(context);
      const icon = getProviderIcon(providerId, {
        color: tooltipColors.text,
        onLoad: () => context.chart.draw(),
      });
      return { pointStyle: icon, rotation: 0 };
    },
  };

  // combine optional overrides and return the tooltip configuration
  return {
    enabled: true,
    intersect: false,
    usePointStyle: true,
    displayColors: true,
    backgroundColor: tooltipColors.background,
    titleColor: tooltipColors.text,
    bodyColor: tooltipColors.text,
    borderColor: tooltipColors.border,
    titleAlign: "center",
    borderWidth: 1,
    padding: 15,
    bodySpacing: 10,
    ...(options ?? {}),
    callbacks: {
      ...tooltipCallbacks,
      ...(options?.callbacks ?? {}),
    } as TooltipOptions<TType>["callbacks"],
  } as TooltipOptions<TType>;
}
