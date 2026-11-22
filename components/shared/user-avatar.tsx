// User avatar — shows the account's profile image when one is set,
// otherwise a default user icon. Shared by the site navbar and the
// dashboard sidebar.
//
// A plain <img> is used on purpose: profile images are user-supplied
// remote URLs (e.g. imgbb), which next/image would reject without
// remotePatterns config churn for every host.

import { CircleUserRound } from "lucide-react"
import { cn } from "@/lib/utils"

export function UserAvatar({
    src,
    name,
    className,
}: {
    src?: string | null
    name?: string | null
    className?: string
}) {
    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={name ? `${name}'s avatar` : "Profile picture"}
                className={cn("size-8 shrink-0 rounded-full object-cover", className)}
            />
        )
    }

    return (
        <CircleUserRound
            aria-label={name ? `${name}'s avatar (default icon)` : "Profile picture"}
            className={cn("size-8 shrink-0 text-white/60", className)}
        />
    )
}
