import {
  Image,
  StyleSheet,
  Platform,
  Linking,
  Button,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from "react";
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Amplify, Auth, Hub } from "aws-amplify";

Amplify.Logger.LOG_LEVEL = "DEBUG"

async function urlOpener(url: string, redirectUrl: string): Promise<void> {
  await InAppBrowser.isAvailable();
  const authSessionResult = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  });

  if (authSessionResult.type === 'success') {
    Linking.openURL(authSessionResult.url);
  }
}


Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_zWOf1kIft',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'ugutdlestbafg0m7qclit8ujm',


    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: 'ptzu-amplify.auth.us-east-1.amazoncognito.com',
      scope: [
        'email',
        'openid'
      ],
      redirectSignIn: 'https://www.amazon.com/',
      redirectSignOut: 'https://management.ntu.edu.tw/IM',
      responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
});

// You can get the current config object
const currentConfig = Auth.configure();
  
function App() {
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
          <Button title="Cognito" onPress={() => Auth.federatedSignIn()} />
          <Button title="222" onPress={() => Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })}  />
          <Button title="1111" onPress={() => getGoogleClick()} />
        </>
      )}
    </View>
  );
}

export default App;
