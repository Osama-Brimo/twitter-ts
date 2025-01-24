import { Trend } from "@prisma/client";

export type Order = 'asc' | 'desc';

interface EnumObject {
    [enumValue: number]: string;
}

export function getEnumValues(e: EnumObject): string[] {
    return Object.keys(e).map((i) => e[i]);
}
