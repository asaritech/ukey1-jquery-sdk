# Ukey1 SDK plugin for jQuery

This repository contains the open source jQuery plugin that allows you to client-side access the **[Ukey1 API](http://ukey.one)** from your website that uses jQuery.

## About Ukey1

[Ukey1](http://ukey.one) is *an aggregator of your user's social identities*.
Ukey1 is also a [OAuth 2.0](https://oauth.net/2/) provider but what is more important, it connects all major identity providers
(like [Google](https://developers.google.com/identity/) or [Facebook](https://developers.facebook.com/docs/facebook-login))
into one sophisticated solution. It's the easiest way to login to websites! Read [more](http://ukey.one/).

### Ukey1 flow for this jQuery SDK

1. User clicks to "sign-in" button
  - you may use our [unified sign-in button](https://github.com/asaritech/ukey1-signin-button)
2. SDK sends a connection request to our API and gets a unique Gateway URL
3. User is redirected to Ukey1 Gateway
4. User signs in using their favourite solution and authorizes your app
5. User is redirected back to predefined URL
6. SDK checks the result and gets a unique access token - user is authenticated
7. SDK gets user's data and that's it

### API specification

You can also download our API specification in the following formats:
- [RAML 1.0 specification](https://ukey1.nooledge.com/var/public/api.raml) (learn more about [RAML](http://raml.org/))
- [Swagger 2.0 specification](https://ukey1.nooledge.com/var/public/api.yaml) (learn more about [Swagger](http://swagger.io/) or open the specification in [editor](http://editor.swagger.io/#/))

## Requirements

- [jQuery](http://jQuery.com/) >=1.6.0
- [js-cookie](https://www.npmjs.com/package/js-cookie) ^2.1.3

## CDN

We use [GitCDN](https://gitcdn.xyz/).
You may also download [dist/jquery.ukey1.min.js](https://raw.githubusercontent.com/asaritech/ukey1-jquery-sdk/master/dist/jquery.ukey1.min.js) and use this file
directly from your web server.

## Usage

First, you need your `App ID`. Remember that jQuery SDK serves for client-side apps, so *you won't need the Secret Key*!
We also recommend to set the *Client-side protection* in our Developer Console.

**Important! This plugin is based on jQuery and requires also js-cookie plugin.**

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/js.cookie.js"></script>
<script src="https://gitcdn.xyz/repo/asaritech/ukey1-jquery-sdk/master/dist/jquery.ukey1.min.js"></script>
```

### Example

First, let's see how to redirect user to Ukey1 Gateway...

```javascript
$(function() {
  var UKEY1_APP_ID = 'your-app-id';

  $('.ukey1-button').click(function(e) {
    e.preventDefault();

    var options = {
      appId: UKEY1_APP_ID,

      // This is an URL for redirection back to the app
      // Do you know what is absolutely perfect?
      // - it may be unique
      // - it may contain query parameters and/or fragment
      returnUrl: 'http://example.org/login?action=check&user=XXX#fragment',

      // Here is a list of possible grants:
      // - `access_token` (always default)
      // - `email` (access to user's email)
      // - `image` (access to user's thumbnail)
      // NOTE: If you are eligible to use "!" (means a required value), you may use it with `email!` and `image!`
      // NOTE: `refresh_token` is prohibited for client-side integrations!
      scope: ['access_token', 'email', 'image'],

      // This option allows you change the gateway screen (Sign up versus Log in)
      signup: true
    };

    try {
      new $.ukey1().connect(options);
    } catch (error) {
      console.log('Something was wrong', error);
    }
  });
});
```

Then the user is redirected back to your app. You have to handle the event and call authorization method like this:

```javascript
// ...

function authorizationEvent() {
  var options = {
    appId: UKEY1_APP_ID,
    success: function (data) {
      // This callback is called when user is successfully authorized

      // Store `data` in localStorage or sessionStorage if you want
      // And do whatever you want

      var id = data.id;
      var displayName = data.name.display;
      var firstName = data.name.first_name;
      var surname = data.name.surname;
      var language = data.locale.language;
      var country = data.locale.country;
      var email = (data.email ? data.email : ''); // NOTE: may be empty if user don't wanna share their email with your app
      var image = (data.thumbnail ? data.thumbnail.url : ''); // NOTE: may be empty if user don't wanna share their image with your app
    },
    finished: function (success) {
      // This callback is called everytime (even if request is successful or not)
    }
  };

  try {
    new $.ukey1().accessToken(options);
  } catch (error) {
    console.log('Something was wrong', error);
  }
}

// ...
```

We have also prepared a working [example](https://github.com/noo-zh/ukey1-jquery-sdk-example) - get to know how to implement our SDK quickly!

## License

This code is released under the MIT license. Please see [LICENSE](https://github.com/asaritech/ukey1-jquery-sdk/blob/master/LICENSE) file for details.

## Contributing

If you want to become a contributor of this jQuery SDK, please first contact us (see our email below).
If you would like to work on another SDK (in your favorite language), we will glad to know about you too!

## Contact

Reporting of any [issues](https://github.com/asaritech/ukey1-jquery-sdk/issues) are appreciated.
If you want to contribute or you have a critical security issue, please write us directly to [developers@asaritech.com](mailto:developers@asaritech.com).
