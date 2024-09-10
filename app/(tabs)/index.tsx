import { Linking, Button, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import InAppBrowser from "react-native-inappbrowser-reborn";
import { Amplify, Auth, Hub } from "aws-amplify";
import * as WebBrowser from "expo-web-browser";

Amplify.Logger.LOG_LEVEL = "DEBUG";

async function urlOpener(url: string, redirectUrl: string): Promise<void> {
  await InAppBrowser.isAvailable();
  const authSessionResult = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  });

  if (authSessionResult.type === "success") {
    Linking.openURL(authSessionResult.url);
  }
}

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: "us-east-2",

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: "us-east-2_u0DyCMWvW",

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: "2mpq6knao5rj1dsssv1mtm46ra",

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: "ptzu-google.auth.us-east-2.amazoncognito.com",
      scope: ["profile", "email", "openid"],
      redirectSignIn: "steed://",
      redirectSignOut: "steed://",
      responseType: "token", // or 'token', note that REFRESH token will only be generated when the responseType is code
      signUpVerificationMethod: "code",
      urlOpener: async (url, redirectUrl) => {
        try {
          const res = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            ephemeralWebSession: false,
            preferEphemeralSession: true,
          });
          console.log("res: ", res);
        } catch (error) {
          console.log("ERROR in browser = ", error);
        }

        // try {
        //   const res = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
        //     showTitle: false,
        //     // enableUrlBarHiding: true,
        //     enableDefaultShare: false,
        //     ephemeralWebSession: false,
        //     preferEphemeralSession: true
        //   }).then((data) => {
        //     console.log("data in web broweser = ", data);
        //     console.log("url in web browser = ", url);
        //     console.log("redirectUrl in web browser = ", redirectUrl)
        //   });

        //   console.log("RESPNSE ===", res)
        // } catch(error){
        //   console.log("ERRORRRRR ====", error)
        // }s
      },
    },
  },
});

// You can get the current config object
const currentConfig = Auth.configure();

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
        case "cognitoHostedUI":
          getUser().then((userData) => setUser(userData));
          break;
        case "signOut":
          setUser(null);
          break;
        case "signIn_failure":
        case "cognitoHostedUI_failure":
          console.log("Sign in failure", data);
          break;
      }
    });

    getUser().then((userData) => setUser(userData));
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => console.log("Not signed in"));
  }

  async function getGoogleClick() {
    console.log("google clicking");

    let creds = await Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });

    console.log("google clicking #1 - creds: ", creds);
    const user = await Auth.currentAuthenticatedUser();
    console.log("google clicking #2 - User: ", user);
  }

  return (
    <View>
      <Text>DUMMY</Text>
      <Text>DUMMY</Text>
      <Text>DUMMY</Text>
      <Text>User: {user ? JSON.stringify(user.attributes) : "None"}</Text>
      {user ? (
        <Button title="Sign Out" onPress={() => Auth.signOut()} />
      ) : (
        <>
          <Button title="Cognito" onPress={() => Auth.federatedSignIn()} />
          <Button
            title="Google"
            onPress={() =>
              Auth.federatedSignIn({
                provider: CognitoHostedUIIdentityProvider.Google,
              })
            }
          />
          <Button title="Custom Google" onPress={() => getGoogleClick()} />
          <Button title="Get USer" onPress={() => getUser()} />
        </>
      )}
    </View>
  );
}

export default App;
