
var BrowserDetect = {

  unsupportedAndroidDevice: function() {
    var userAgent = navigator.userAgent
    var agentIndex = userAgent.indexOf('Android');

    if (agentIndex != -1) {
      var androidversion = parseFloat(userAgent.match(/Android\s+([\d\.]+)/)[1]);
      if (androidversion < 4.1) {
        return true
      } else {
        return false
      }
    }

    return false
  },


  deviceDetection: function() {
    var osVersion,
    device,
    deviceType,
    userAgent,
    isSmartphoneOrTablet;

    device = (navigator.userAgent).match(/Android|iPhone|iPad|iPod/i);

    if ( /Android/i.test(device) ) {
        if ( !/mobile/i.test(navigator.userAgent) ) {
            deviceType = 'tablet';
        } else {
            deviceType = 'phone';
        }

        osVersion = (navigator.userAgent).match(/Android\s+([\d\.]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace('Android ', '');

    } else if ( /iPhone/i.test(device) ) {
        deviceType = 'phone';
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace(/_/g, '.');
        osVersion = osVersion.replace('OS ', '');

    } else if ( /iPad/i.test(device) ) {
        deviceType = 'tablet';
        osVersion = (navigator.userAgent).match(/OS\s+([\d\_]+)/i);
        osVersion = osVersion[0];
        osVersion = osVersion.replace(/_/g, '.');
        osVersion = osVersion.replace('OS ', '');
    }
    isSmartphoneOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    userAgent = navigator.userAgent;

    return { 'isSmartphoneOrTablet': isSmartphoneOrTablet,
             'device': device,
             'osVersion': osVersion,
             'userAgent': userAgent,
             'deviceType': deviceType
            };
  },


  isIE: function() {
    if (navigator.userAgent.match(/IE/i))
      return true

    if (!!navigator.userAgent.match(/Trident.*rv\:11\./))
      return true

    return false
  }

}

module.exports = BrowserDetect

