/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../user/user.model";
import config from "../../config";

import { generateUniqueUserId } from "../user/user.utls";
export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {

                clientID: config.google_client_id!,
                clientSecret: config.google_client_secret!,
                callbackURL: config.google_callback_url!,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const provider = "google";
                    const providerId = profile.id;
                    const email = profile.emails?.[0]?.value?.toLowerCase();
                    const name = profile.displayName || "Unknown";
                    const avatarUrl = profile.photos?.[0]?.value;

                    const user = await upsertOAuthUser({ provider, providerId, email, name, avatarUrl });
                    done(null, user);
                } catch (e) {
                    done(e as any, false);
                }
            }
        )
    );

    passport.use(
        new GitHubStrategy(
            {
                clientID: config.github_client_id!,
                clientSecret: config.github_client_secret!,
                callbackURL: config.github_callback_url!,
                scope: ["user:email"],
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const provider = "github";
                    const providerId = profile.id;
                    const email = profile.emails?.[0]?.value?.toLowerCase();
                    const name = profile.displayName || profile.username || "Unknown";
                    const avatarUrl = profile.photos?.[0]?.value;

                    const user = await upsertOAuthUser({ provider, providerId, email, name, avatarUrl });
                    done(null, user);
                } catch (e) {
                    done(e as any, false);
                }
            }
        )
    );

    passport.use(
        new FacebookStrategy(
            {
                clientID: config.facebook_client_id!,
                clientSecret: config.facebook_client_secret!,
                callbackURL: config.facebook_callback_url!,
                profileFields: ["id", "displayName", "photos", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const provider = "facebook";
                    const providerId = profile.id;
                    const email = (profile as any).emails?.[0]?.value?.toLowerCase(); // facebook sometimes missing
                    const name = profile.displayName || "Unknown";
                    const avatarUrl = profile.photos?.[0]?.value;

                    const user = await upsertOAuthUser({ provider, providerId, email, name, avatarUrl });
                    done(null, user);
                } catch (e) {
                    done(e as any, false);
                }
            }
        )
    );
};

async function upsertOAuthUser({
    provider,
    providerId,
    email,
    name,
    avatarUrl,
}: {
    provider: "google" | "github" | "facebook";
    providerId: string;
    email?: string;
    name: string;
    avatarUrl?: string;
}) {
    // 1) email match (account linking)
    let user = email ? await User.findOne({ email, isDeleted: false }) : null;

    // 2) provider match
    if (!user) {
        user = await User.findOne({ provider, providerId, isDeleted: false });
    }

    if (!user) {
        const id = await generateUniqueUserId();
        user = await User.create({
            id,
            name,
            email,
            avatar: avatarUrl ? { url: avatarUrl, public_id: "" } : undefined,
            provider,
            providerId,
            role: "user",
            status: "active",
            isDeleted: false,
        });
    } else {
        // update provider info (keep role/status/password as-is)
        user.name = name || user.name;
        if (email && !user.email) user.email = email;
        user.provider = provider as any;
        user.providerId = providerId;
        if (avatarUrl) user.avatar = { url: avatarUrl, public_id: user.avatar?.public_id || "" } as any;
        await user.save();
    }

    return user;
}