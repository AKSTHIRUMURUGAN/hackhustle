import React, { useEffect } from "react";

function Payu({key,amount}) {

    function loadWidget() {
      const widgetConfig = { key, amount };
      payuAffordability.init(widgetConfig);
    }
  
    function appendScript() {
      let myScript = document.getElementById("payu-affordability-widget");
      if(!myScript){	
          myScript = document.createElement('script');
          myScript.setAttribute('src', "https://jssdk.payu.in/widget/affordability-widget.min.js");
          myScript.id="payu-affordability-widget";
          document.body.appendChild(myScript);
      }
      myScript.addEventListener('load', loadWidget, true);
    }
  
    useEffect(() => {
        appendScript();
    }, [])

    return (
      <div id="payuWidget"/>  
    )
}

export default Payu;