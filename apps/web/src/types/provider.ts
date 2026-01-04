import type { ComponentType, SVGProps } from "react";
import type { ProviderMetadata } from "@chatwar/shared";

export type Provider = ProviderMetadata & {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};
