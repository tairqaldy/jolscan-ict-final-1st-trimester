import type { CheckWithSource } from "@/lib/store/restroom-history";
import { signTitle } from "./compare-result";

/** Link and label of one restroom sign check (the platform overview list and the check page). */
export const checkHref = (id: string) => `/app/restrooms/checks/${id}`;
export const checkLabel = (c: CheckWithSource) => c.place ?? `${signTitle(c.inputs.a, "Sign a")} / ${signTitle(c.inputs.b, "Sign b")}`;
