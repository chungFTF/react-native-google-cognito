// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   SafeAreaView,
//   Text,
// } from "react-native";

// import { AuthUser, getCurrentUser, signInWithRedirect, signOut } from "@aws-amplify/auth";
// import { Hub } from "@aws-amplify/core";


// function App(): JSX.Element {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [error, setError] = useState<unknown>(null);
//   const [customState, setCustomState] = useState<string | null>(null);

//   useEffect(() => {
//     const unsubscribe = Hub.listen("auth", ({ payload }) => {
//       switch (payload.event) {
//         case "signInWithRedirect":
//           getUser();
//           break;
//         case "signInWithRedirect_failure":
//           setError("An error has occurred during the OAuth flow.");
//           break;
//         case "customOAuthState":
//           setCustomState(payload.data); // this is the customState provided on signInWithRedirect function
//           break;
//       }
//     });

//     getUser();

//     return unsubscribe;
//   }, []);
  
//   const getUser = async (): Promise<void> => {
//     try {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);
//     } catch (error) {
//       console.error(error);
//       console.log("Not signed in");
//     }
//   };

//   return (
//     <SafeAreaView>
//       <Button title="Sign In" onPress={() => signInWithRedirect({ provider: "google"})}></Button>
//       <Text>{user?.username}</Text>
//       <Text>{customState}</Text>
//       <Button title="Sign Out" onPress={() => signOut()}></Button>
//     </SafeAreaView>
//   );
// }


import { Image, StyleSheet, Platform } from 'react-native';
import { useEffect, useState } from "react";
// import { HelloWave } from '@/components/HelloWave';
// import ParallaxScrollView from '@/components/ParallaxScrollView';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Button, Linking, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Amplify, Auth, Hub } from "aws-amplify";

Amplify.Logger.LOG_LEVEL = "DEBUG"

// async function urlOpener(url: string, redirectUrl: string): Promise<void> {
//   await InAppBrowser.isAvailable();
//   const authSessionResult = await InAppBrowser.openAuth(url, redirectUrl, {
//     showTitle: false,
//     enableUrlBarHiding: true,
//     enableDefaultShare: false,
//     ephemeralWebSession: false,
//   });
//   console.log("authSessionResult = ", authSessionResult)
//   if (authSessionResult.type === 'success') {
//     Linking.openURL(authSessionResult.url);
//   }
// }

function App() {
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-2',
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-2_NAMeNcssO',
    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '5cc725gen2j2ilr10a6llhg6nf',

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: 'pingtzu-google.auth.us-east-2.amazoncognito.com',
      scope: [
        'profile',
        'email',
        'openid'
      ],
      redirectSignIn: 'https://www.amazon.com',
      redirectSignOut: 'https://management.ntu.edu.tw/IM',
      responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
      urlOpener: async (url, redirectUrl) => {
        try {
          const res = await WebBrowser.openAuthSessionAsync(url, redirectUrl, {
            showTitle: false,
            // enableUrlBarHiding: true,
            enableDefaultShare: false,
            ephemeralWebSession: false,
            preferEphemeralSession: true
          });
          console.log("RESPNSE ===", res)
        } catch(error){
          console.log("ERRORRRRR ====", error)
        }
    }
  }
  }
});

// You can get the current config object
const currentConfig = Auth.configure();
console.log("ALOHA currentConfig = ", currentConfig)


const [user, setUser] = useState(null);

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then(userData => setUser(userData));
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
  }
  
  async function getGoogleClick(){
    console.log("google clicking")
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google });
    const user = await Auth.currentAuthenticatedUser();
    console.log("USER = ", user)
  }
  

  return (
    <View>
      <Text>User: {user ? JSON.stringify(user.attributes) : 'None'}</Text>
      {user ? (
        <Button title="Sign Out" onPress={() => Auth.signOut()} />
      ) : (
        <>
          {/* Go to the Cognito Hosted UI */}
          <Button title="Cognito" onPress={() => Auth.federatedSignIn()} />

          {/* Go directly to a configured identity provider */}
          <Button title="Facebook" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook })} />
          <Button title="222" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}  />
          <Button title="1111" onPress={() => getGoogleClick()} />
          <Button title="Amazon" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Amazon })} />
        </>
      )}
    </View>
  );
}

export default App;
  
  

// export default function HomeScreen() {
 
//   return (
// <View>
//       <Text>User: {user ? JSON.stringify(user.attributes) : 'None'}</Text>
//       {user ? (
//         <Button title="Sign Out" onPress={() => Auth.signOut()} />
//       ) : (
//         <>
//           {/* Go to the Cognito Hosted UI */}
//           <Button title="Cognito" onPress={() => Auth.federatedSignIn()} />

//           {/* Go directly to a configured identity provider */}
        
//           <Button title="Google" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}  />
        
//         </>
//       )}
//     </View>
//   );
// }

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
