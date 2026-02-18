import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useAuth } from "../context/AuthContext";
import { GoogleConfig } from "../constants/googleConfig";

WebBrowser.maybeCompleteAuthSession();

export default function useGoogleAuth() {
    const { googleLogin } = useAuth();

    const redirectUri = makeRedirectUri({
        useProxy: true, // Expo Go
    });

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: GoogleConfig.webClientId,
        redirectUri,
        scopes: ["openid", "profile", "email"],
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;

            if (id_token) {
                googleLogin(id_token);
            }
        }

        if (response?.type === "error") {
            console.error("[useGoogleAuth] Google error:", response.error);
        }
    }, [response]);

    return { request, promptAsync };
}
