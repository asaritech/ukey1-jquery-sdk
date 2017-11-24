# Ukey1 SDK plugin for jQuery

This repository contains the open source jQuery plugin that allows you to client-side access the **[Ukey1 API](http://ukey.one)** from your website that uses jQuery.

**!!! Please note that versions older than 2.0.0 are deprecated and don't work since November 15, 2017 !!!**

## About Ukey1

[Ukey1](https://ukey.one) is an Authentication and Data Protection Service with the mission to enhance security of websites. 
The service is designed to help you with EU GDPR compliance.

### Ukey1 flow for this jQuery SDK

1. User clicks to "sign-in" button
  - you may use our [unified sign-in button](https://github.com/asaritech/ukey1-signin-button)
2. SDK sends a connection request to our API and gets a unique Gateway URL
3. User is redirected to Ukey1 Gateway
4. User signs in using their favourite solution and authorizes your app
5. User is redirected back to predefined URL
6. SDK checks the result and gets a unique access token - user is authenticated
7. That's it - user is authenticated (your app can make API calls to get user's data)

### API specification

- [API specification](https://ukey1.docs.apiary.io/)
- [Documentation](https://asaritech.github.io/ukey1-docs/)

## Requirements

- [jQuery](http://jQuery.com/) >=1.6.0
- [js-cookie](https://www.npmjs.com/package/js-cookie) ^2.1.3

## Usage

First, you need [App ID](https://dashboard.ukey.one/developer). In our dashboard, we also recommend to activate Domain and Return URL Protection.

**Important! This plugin is based on jQuery and requires also js-cookie plugin.**

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/js.cookie.js"></script>
<script src="https://gateway.ukey1cdn.com/components/ukey1-jquery-sdk/v2.0.0/jquery.ukey1.min.js"></script>
```

### Example

First, let's see how to redirect user to Ukey1 Gateway...

```javascript
$(function() {
  var UKEY1_APP_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

  $('.ukey1-button').click(function(e) {
    e.preventDefault();

    var options = {
      appId: UKEY1_APP_ID,

      // This is an URL for redirection back to the app
      // Do you know what is absolutely perfect?
      // - it may be unique
      // - it may contain query parameters and/or fragment
      returnUrl: 'http://example.org/login?action=check&user=XXX#fragment',

      // See the full list of permissions: https://asaritech.github.io/ukey1-docs/Docs/Permissions/#data-fields
      scope: ['firstname', 'email'],

      // This option allows you to change the message on the gateway screen ("Sign up" versus "Log in")
      signup: true
    };

    try {
      new $.ukey1().connect(options);
    } catch (error) {
      console.log('Something went wrong', error);
    }
  });
});
```

Once the user authorizes your app, Ukey1 redirects the user back to your app to the URL you specified earlier. 
The same is done if user cancels the request. You have to handle the event and call authorization method like this:

```javascript
// ...

function authorizationEvent() {
  var options = {
    appId: UKEY1_APP_ID,
    success: function (user, scope) {
      // This callback is called when user is authenticated and your app is authorized

      var id = user.id;

      // Please note that everything excepts ID and mandatory fields may be empty if the user decides to not to grant you access to that field
      var firstName = user.firstname;
      var email = user.email;

      console.log(user, scope);
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

We have also prepared a working [example](https://github.com/noo-zh/ukey1-jquery-sdk-example) - try it and get to know how to implement our SDK quickly!

## License

This code is released under the MIT license. Please see [LICENSE](https://github.com/asaritech/ukey1-jquery-sdk/blob/master/LICENSE) file for details.

## Contributing

If you want to become a contributor of this jQuery SDK, please first contact us (see our email below).
If you would like to work on another SDK (in your favorite language), we will glad to know about you too!

## Contact

Reporting of any [issues](https://github.com/asaritech/ukey1-jquery-sdk/issues) are appreciated.
If you want to contribute or you have a critical security issue, please write us directly to [developers@asaritech.com](mailto:developers@asaritech.com).
