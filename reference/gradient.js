/* Overview of major changes, done by Anthony Martinez (http://www.linkedin.com/in/canthonymartinez/). (All other script/CSS Annotations by me are preceded by "AM:")
 *
 * 1) Added full support for new unprefixed W3C syntax gradients (using 'to <destination>' syntax).
 * 2) Added logic to calculate degrees differently, to match the new W3C syntax.
 * 		For example, try -moz-linear-gradient(72deg,#fff,#000) and linear-gradient(72deg,#fff,#000) in CSS -- they render differently.
 *		Then input them into this script, and they should each render in SVG the same way they do in CSS.
 * 3) If all color stop percentages are missing, then the script will now interpolate them, as happens in CSS.
 *		If only the start and ending stops are missing, the script will add them.
 * 4) If no directions or angle units are specified, the script will now assume defaults, as happens in CSS.
 * 5) "Angle units"? Yeah, there's now support for all valid units, (deg, rad, grad, & turns). Plus negative values and decimals work.
 * 6) Improved support for old Webkit syntax -- from() and to() will work as expected, even with decimals, and even if to() comes before other color-stops (as is acceptable).
 * 7) Added support for RGB/A percents, HSL/A, floating points in RGB/A and HSL/A, color names, and 'transparent' keyword.
 * 8) Added logic to convert alpha values and 'transparent' to proper SVG 'stop-opacity' values.
 * 9) Overhauled the SVG vector generation logic, greatly improving accuracy.
 *10) Added optional IE9 base64 output for CSS.
 *11) Added multiple background support. Yes! No other SVG or gradient generator I'm aware of, even the awesome visualcsstools.com that I drew inspiration from, has this.
 *12) Extended SVG preview display/update capabilites to all capable browsers (Chrome 7+, IE9+, FF4+, Safari 5.1+, Opera 11.6+)
 *
 * Issues I'm aware of:
 *
 * 1) Still no radial-gradient support yet, but I plan to figure that out not too long from now!
 * 2) For some reason, FF3.6 and below can only do one conversion per page load/refresh. Those browsers are ancient, though. So, perhaps they're not worth trying to fix? It's odd, though. Even IE7 works the script flawlessly!
 * 3) Older browsers that don't fully support RGBA or HSL/A will trip on the color validation loop I included, if input gradient(s) has/have RGBA and/or HSL/A.
 *
 * Test case:
 *
 * Try this garish tri-gradient for some fun with every allowable color-type (plus errant values thrown in for extra fun), percents everywhere, and colors, colors everywhere!
 * On top is a gratuitous semi-transparent to transparent orangish layer (just to demonstrate a non-degree unit).
 * Then, we have a hideous looking second layer, on top of an even worse layer of all valid color names in CSS3/SVG. Who wants to calculate stops for nearly 150 colors? :P The script will do it!
 *
 * background:linear-gradient(1.79rad,rgba(255,135,15,.55),hsla(120,0%,0%,0)),linear-gradient(66deg,palegreen,#3f5 5%,hsla(89,60%,50%,.6) 15%,#0ed7ac 30%,transparent 35%,rgb(30%,25%,190%) 40%,rgba(37,37,22,.77) 51.5%,pink 62.6%,hsla(415,167%,150%,.5) 68.39%,black 75.5%,orange 87%,#123 95%,rgba(300,35,66,.5)),linear-gradient(to bottom right,red,tan,aqua,blue,cyan,gold,gray,grey,lime,navy,peru,pink,plum,snow,teal,azure,beige,black,brown,coral,green,ivory,khaki,linen,olive,wheat,white,bisque,indigo,maroon,orange,orchid,purple,salmon,sienna,silver,tomato,violet,yellow,crimson,darkred,dimgray,dimgrey,fuchsia,hotpink,magenta,oldlace,skyblue,thistle,cornsilk,darkblue,darkcyan,darkgray,darkgrey,deeppink,honeydew,lavender,moccasin,seagreen,seashell,aliceblue,burlywood,cadetblue,chocolate,darkgreen,darkkhaki,firebrick,gainsboro,goldenrod,indianred,lawngreen,lightblue,lightcyan,lightgray,lightgrey,lightpink,limegreen,mintcream,mistyrose,olivedrab,orangered,palegreen,peachpuff,rosybrown,royalblue,slateblue,slategray,slategrey,steelblue,turquoise,aquamarine,blueviolet,chartreuse,darkorange,darkorchid,darksalmon,darkviolet,dodgerblue,ghostwhite,lightcoral,lightgreen,mediumblue,papayawhip,powderblue,sandybrown,whitesmoke,darkmagenta,deepskyblue,floralwhite,forestgreen,greenyellow,lightsalmon,lightyellow,navajowhite,saddlebrown,springgreen,yellowgreen,antiquewhite,darkseagreen,lemonchiffon,lightskyblue,mediumorchid,mediumpurple,midnightblue,darkgoldenrod,darkslateblue,darkslategray,darkslategrey,darkturquoise,lavenderblush,lightseagreen,palegoldenrod,paleturquoise,palevioletred,blanchedalmond,cornflowerblue,darkolivegreen,lightslategray,lightslategrey,lightsteelblue,mediumseagreen,mediumslateblue,mediumturquoise,mediumvioletred,mediumaquamarine,mediumspringgreen,lightgoldenrodyellow)
 *
 * Now try the same gradient in CSS using IE10, FF16+, Chrome 26+, or Opera 12.1+. It should look the same!
 */
if (!window.trim) {
  String.prototype.trim = function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  };
} // AM: IE8- doesn't natively support trim()

// AM: adapted from stackoverflow.com/questions/6970221/parsing-css-background-image#answer-6970814 -- allows for parsing of multiple backgrounds. Trips up FF3.6-, however--the convert button will only work once per page load.
function split(string) {
  var token = /((?:(?:rgb|hsl)a?\(.*?\)\s*\d{0,3}(?:\.\d+)?%?|[^"']|".*?"|'.*?')*?)([(,)]|$)/g; // AM: Modded to permit (rgb|hsl)a?(<colors>) <stop>%, -- without fix, the <stop>% gets trashed, throwing off everything else--ugh.
  return (function recurse() {
    for (var array = []; ; ) {
      var result = token.exec(string);
      if (result[2] == '(') {
        array.push(result[1].trim() + '(' + recurse().join(',') + ')');
        result = token.exec(string);
      } else array.push(result[1].trim());
      if (result[2] != ',') return array;
    }
  })();
}

if (!window.btoa) {
  document.getElementById('b64').style.cssText = 'display:none';
} // AM: IE9- won't see the checkbox to generate base64 output for IE9.

/* AM: More browsers can manipulate the preview now. Any browser that has inline SVG support (IE9+, Chrome 7+, FF4+, Opera 11.6+, and Safari 5.1+) can do so.
 * Function borrowed from https://gist.github.com/mstalfoort/1293822.
 * In addition, I adjusted your below code to remove the document\.write, because document\.write is generally poor for page loading performance.
 */
function hasInlineSvg() {
  var svgd = document.createElement('div');
  svgd.innerHTML = '<svg/>';
  return (svgd.firstChild && svgd.firstChild.namespaceURI) == 'http://www.w3.org/2000/svg';
}

if (hasInlineSvg()) {
  document.getElementById('updatetext').innerHTML =
    '<br /><button class="button right update" onmousedown="updatePreview()">Update</button><p class="update">You can also edit the code in the box directly, then click the "Update" button to apply the changes to the preview below.</p><h2 class="prevhead">Preview:</h2><div id="preview" class="center"></div>';
} else {
  var outp = document.getElementById('output');
  outp.readOnly = true;
} // AM: disable editing of codebox if update function won't work anyway.

var svgAngle = '',
  svg = '',
  svgHeight = '300',
  svgWidth = '300',
  myAngle = '',
  gradientType = 'linear',
  dir = '',
  dirl = '',
  stopsArray = [],
  colorArray = [],
  stl = '',
  units = '%',
  prev = '',
  bl = '',
  oldwebkit = '';
function init() {
  prev = hasInlineSvg() ? document.getElementById('preview') : ''; // AM: preview only visible to browsers with inline SVG support.
  (oldwebkit = ''), (tofromfix = ''), (svgAngle = ''), (svg = ''), (x1 = 0), (y1 = 0), (x2 = 100), (y2 = 0); // AM: reset key variables upon each convert. Otherwise, strange gradient renderings may occur.
  if (document.getElementById('userH') != '') {
    svgHeight = document.getElementById('userH').value;
  }
  if (document.getElementById('userW') != '') {
    svgWidth = document.getElementById('userW').value;
  }
  if (!document.getElementById('userUnit').checked) {
    units = 'px';
  } else {
    units = '%';
  }
}

function splitGradient(string) {
  init();
  if (string.match('radial')) {
    alert('This converter currently only supports LINEAR Gradients');
    document.getElementById('output').value = 'Error: Please enter a valid linear gradient in the box above.';
  }
  var bgs = split(string),
    bl = bgs.length;
  while (bl--) {
    // Find Direction //
    if (bgs[bl].match(/\-?\d{1,3}(?:\.\d+)?(?:deg|g?rad|turn)/)) {
      dir = bgs[bl].match(/\-?\d{1,3}(?:\.\d+)?(?:deg|g?rad|turn)/gi); // AM: Allow negative angles and decimals, plus allow other (rarer) standard units
      if (dir[0].match(/g?rad|turn/)) {
        if (dir[0].match(/grad/)) {
          dir[0] = parseFloat(dir[0]) / 1.1111111;
        } //
        else if (dir[0].match(/rad/)) {
          dir[0] = parseFloat(dir[0]) / 0.0174532925199;
        } // AM: convert other units to degrees
        else {
          dir[0] = parseFloat(dir[0]) * 360;
        } //
      }
      dir = dir.join('').replace(/deg|g?rad|turn/g, '');
      if (!bgs[bl].match(/-(moz|webkit|o|ms)-/)) {
        dir = parseFloat(90 - dir);
      } // AM: Degrees in unprefixed W3C syntax are measured differently
    }
    // AM: isolate old webkit-gradient syntax early
    else if (bgs[bl].match(/-webkit-gradient/)) {
      if (bgs[bl].match(/left|right|\btop\b|bottom|center/)) {
        (dir = bgs[bl].match(/left|right|\btop\b|bottom|center/g)), (dirl = dir.length);
        while (dirl--) {
          dir[dirl] = dir[dirl]
            .replace(/left|top/g, '0')
            .replace(/right|bottom/g, '100')
            .replace(/center/g, '50');
        } // AM: convert keywords to corresponding percents.
      } else {
        // AM: Point-to-point figures
        dir = bgs[bl].match(/(\-?\d+\.?\d*%?)/g);
        (dir = dir.slice(0, 4)), (dirl = dir.length); // AM: Get only what's needed, the first four #'s or %'s
        while (dirl--) {
          if (!dir[dirl].match(/%/)) {
            // AM: Convert pixel values to %
            var wh = dirl % 2 == 1 ? svgHeight : svgWidth; // AM: Make sure x-points get divided by width and y, by height.
            dir[dirl] = (dir[dirl] / wh) * 100;
          }
        }
      }
      (x1 = Math.round(parseFloat(dir[0]) * 100) / 100),
        (y1 = Math.round(parseFloat(dir[1]) * 100) / 100),
        (x2 = Math.round(parseFloat(dir[2]) * 100) / 100),
        (y2 = Math.round(parseFloat(dir[3]) * 100) / 100);
      (oldwebkit = 'yes'), (tofromfix = bgs[bl].match(/from\(.*?\),\s*to\(.*?\),\s*color-stop/) ? 'yes' : ''); // AM: Webkit allows to() to come before color-stops. If that happens, then extra processing will happen below.
    }
    // AM: Combined and simplified, to permit use of 'to' found in new W3C syntax and check for the presence of one or two direction key words, all in one step.
    else if (bgs[bl].match(/(to )?(top|left|right|bottom)/)) {
      dir = bgs[bl].match(/(to )?(top|left|right|bottom)\s?(top|left|right|bottom)?/gi);
      if (dir[0].match(/(right|left)/)) {
        dir[0] = dir[0].replace(/(right|left)\s(top|bottom)/g, '$2 $1');
      } // AM: normalize keyword order for normalizeAngle
      dir = dir.join('').replace(/\s/g, '');
    } else if (!bgs[bl].match(/center/)) {
      // AM: no direction or degrees included; use defaults: 'top' in older prefixed syntax, 'to bottom' in new W3C. If 'center' is found, error will be thrown below in normalizeAngle.
      var dir = bgs[bl].match(/-(moz|webkit|o|ms)-/) ? 'top' : 'tobottom';
    }
    bgs[bl] = bgs[bl].replace(
      /color-stop|repeating|linear|radial|gradient|-(moz|webkit|o|ms)-|background(-image)?\:|deg|rad|g?rad|turn|to\s|\btop\b|right|left|bottom|center|-| /g,
      ''
    ); // AM: Moved, plus adjusted and expanded
    //Match 3 or 6 Hex, RGB Decimal, RGBA Decimal // // AM: Now includes color names, RGB/A %, and HSL/A, with floating points permitted
    //colorArray=string.match(/#([0-9A-Fa-f]{3})?([0-9A-Fa-f]{3})|rgb\([0-9]*?[0-9]*?[0-9],[0-9]*?[0-9]*?[0-9],[0-9]*?[0-9]*?[0-9],*?[0-9]*?\)|rgba\([0-9]*?[0-9]*?[0-9],[0-9]*?[0-9]*?[0-9],[0-9]*?[0-9]*?[0-9],*?[0-9\.]*?\)/gi);
    (colorArray = bgs[bl].match(/(?:from\(|to\()?(#([\da-f]{3}){1,2}|(rgb|hsl)a?\((\d{1,3}(\.\d+)?%?,?){3}[0-1]?\.?\d*\)|[a-z]+)/gi)),
      (col = colorArray.length);

    /* AM: test for parse-able colors in gradient. Ex: Browsers should throw an error (at least FF does) if rgb() has 4 values, which above regex permits.
     * If support for IE8-,FF2-,O9.6-,or S3.1- is needed, this test may trip those browsers since they don't all support RGB/A & HSL/A.
     * Test is permissive. Chances are, it will let RGB values >255, alpha values >1, HSL hues >360, and percents >100 pass even when technically invalid. Browsers usually parse such values as allowable max, anyway.
     * However, there's no error-checking here for totally invalid values that colorArray will miss above, such as negative RGB decimal values.
     * Test will also pick up any stray values not processed by the direction check above.
     */
    var div = document.createElement('div');
    while (col--) {
      colorArray[col] = colorArray[col].replace(/(?:from|to)\(/, '');
      div.style.cssText = 'color:' + colorArray[col];
      if (!div.style.color) {
        document.getElementById('output').value = 'Error: Please enter a valid linear gradient in the box above. Check your direction and/or color values.';
        return false;
      }
    }
    div = null;
    //stopsArray=string.match(/\d{1,3}%/g);
    // AM: Check for stop %s or floating-points (old Webkit syntax), preceded by #XXX; #XXXXXX; ')' at end of RGB/A or HSL/A; '(' in 'to', 'from', or 'color-stop' functions; or color name, but ignore RGB/A+HSL/A %s themselves.
    stopsArray = bgs[bl].match(/(?:\)|#(?:[\da-f]{3}){1,2}|(?:from|to|[^bla])\(|,[a-z]+)(1?\d{1,2}\.?\d*%|0?\.\d+)/gi);
    if (stopsArray === null) {
      stopsArray = ['0%', '100%'];
      getMiddleStops(colorArray.length - 2);
    } // AM: no stop values defined, so use starting and ending defaults, then interpolate middle stop values
    else if (colorArray.length - stopsArray.length == 2) {
      stopsArray.unshift('0%');
      stopsArray.push('100%');
    } // AM: only starting and ending stop values missing? Then add them at respective ends.
    else if (colorArray.length - stopsArray.length > 0) {
      document.getElementById('output').value =
        'Error: Gradient could not be parsed. Please check your stop values. For best results, make sure to specify all of them in order using percent values only, or leave them all off for the script to calculate equal stops for you.';
      return false;
    }

    stl = stopsArray.length;
    while (stl--) {
      stopsArray[stl] = stopsArray[stl].replace(/\)|#(?:[\da-f]{3}){1,2}|(?:from|to|[^bla])\(|,[a-z]+|/, ''); // AM: get rid of junk to leave the percents
      if (!stopsArray[stl].match(/%/)) {
        stopsArray[stl] = parseFloat(stopsArray[stl]) * 100 + '%';
      }
    } // AM: convert Webkit-style decimals to %s.
    if (tofromfix == 'yes') {
      var tofix = colorArray.splice(1, 1);
      colorArray.push(tofix.toString());
    } // AM: Move color in to() function to end of array.
    if (oldwebkit == '') {
      normalizeAngle(dir, bl);
    } else {
      buildSVG(bl);
    }
  }
  finishSVG(svg, bgs.length);
}

function getMiddleStops(s) {
  if (s == 0) {
    return true;
  } // AM: there are only 2 color stops
  else {
    var i = s;
    while (i--) {
      var middleStop = 100 - (100 / (s + 1)) * (i + 1), // AM: Ex - For 3 middle stops, progression will be 25%, 50%, and 75%, plus 0% and 100% at the ends.
        middleStopString = middleStop + '%';
      stopsArray.splice(-1, 0, middleStopString);
    } // AM: add into stopsArray before 100%
  }
}

function normalizeAngle(st, bl) {
  /*
   * AM: Greatly simplified this check to limit to only valid strings (including new W3C syntax). See https://developer.mozilla.org/docs/Web/CSS/linear-gradient for valid syntax.
   * However, 'center' is a missing keyword. It's invalid in the new W3C syntax, and was poorly supported in the previous prefixed syntax (I think only FF supported it).
   * Old Webkit syntax is entirely isolated and processed separately before ever reaching this point, thus making it possible to simplify the below matrix even further.
   */
  if (isNumber(st) === true) {
    myAngle = st;
    SVGangle(myAngle, bl);
  } // AM: Angle defined, proceed to calculate vector coords
  else {
    // AM: Direction keywords defined -- use corresponding pre-determined vector coords and then go straight to buildSVG
    if (st == 'toright' || st == 'left') {
    } // AM: SVG default vector coords will be used
    else if (st == 'totopright' || st == 'bottomleft') {
      (y1 = 100), (x2 = 100);
    } else if (st == 'totop' || st == 'bottom') {
      (x1 = 100), (y1 = 100), (x2 = 100);
    } else if (st == 'totopleft' || st == 'bottomright') {
      (x1 = 100), (y1 = 100), (x2 = 0);
    } else if (st == 'toleft' || st == 'right') {
      (x1 = 100), (y1 = 100), (x2 = 0), (y2 = 100);
    } else if (st == 'tobottomleft' || st == 'topright') {
      (x1 = 100), (x2 = 0), (y2 = 100);
    } else if (st == 'tobottom' || st == 'top') {
      (x2 = 0), (y2 = 100);
    } else if (st == 'tobottomright' || st == 'topleft') {
      (x2 = 100), (y2 = 100);
    } else {
      document.getElementById('output').value =
        "Error: Please enter a valid linear gradient in the box above. Check your direction value(s). Valid keywords are 'top', 'right', 'bottom', and 'left'.";
      return false;
    }
    buildSVG(bl);
  }
}

// AM: check if variable is a number -- stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript#answer-1421988
function isNumber(o) {
  return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
}

function SVGangle(v, bl) {
  //Here's a more accurate way of getting vector coordinates. Code is adapted from the awesome visualcsstools.com.
  var w = parseFloat(svgWidth),
    h = parseFloat(svgHeight),
    ang = parseFloat(v),
    o = 2,
    n = 2,
    wc = w / 2,
    hc = h / 2,
    tx1 = 2,
    ty1 = 2,
    tx2 = 2,
    ty2 = 2,
    k = ((ang % 360) + 360) % 360,
    j = ((360 - k) * Math.PI) / 180,
    i = Math.tan(j),
    l = hc - i * wc;
  if (k == 0) {
    (tx1 = w), (ty1 = hc), (tx2 = 0), (ty2 = hc);
  } else if (k < 90) {
    (n = w), (o = 0);
  } else if (k == 90) {
    (tx1 = wc), (ty1 = 0), (tx2 = wc), (ty2 = h);
  } else if (k < 180) {
    (n = 0), (o = 0);
  } else if (k == 180) {
    (tx1 = 0), (ty1 = hc), (tx2 = w), (ty2 = hc);
  } else if (k < 270) {
    (n = 0), (o = h);
  } else if (k == 270) {
    (tx1 = wc), (ty1 = h), (tx2 = wc), (ty2 = 0);
  } else {
    (n = w), (o = h);
  }
  // AM: I could not quite figure out what m, n, and o are supposed to represent from the original code on visualcsstools.com.
  var m = o + n / i,
    tx1 = tx1 == 2 ? (i * (m - l)) / (Math.pow(i, 2) + 1) : tx1,
    ty1 = ty1 == 2 ? i * tx1 + l : ty1,
    tx2 = tx2 == 2 ? w - tx1 : tx2,
    ty2 = ty2 == 2 ? h - ty1 : ty2;
  (x1 = Math.round((tx2 / w) * 100 * 100) / 100),
    (y1 = Math.round((ty2 / h) * 100 * 100) / 100),
    (x2 = Math.round((tx1 / w) * 100 * 100) / 100),
    (y2 = Math.round((ty1 / h) * 100 * 100) / 100);
  buildSVG(bl);
}

function buildSVG(bl) {
  var ranID = Math.floor(Math.random() * 1001),
    sr = stopsArray.length < 20 ? 100 : 1000; // AM: With a large number of stops, a greater decimal precision of the offsets could be useful.
  svgAngle = ' gradientUnits="userSpaceOnUse" x1="' + x1 + '%" y1="' + y1 + '%" x2="' + x2 + '%" y2="' + y2 + '%"';
  svgAngle = svgAngle.replace(/ x1="0%"| x2="100%"| y1="5?0%"| y2="5?0%"/g, ''); // AM: remove default or equal values when present.
  // AM: remove gradientUnits if coords are within bounding box...except in case of old Webkit syntax, which apparently (and oddly) depends on it for accurate rendering. Go figure.
  if (x1 >= 0 && x1 <= 100 && y1 >= 0 && y1 <= 100 && x2 >= 0 && x2 <= 100 && y2 >= 0 && y2 <= 100 && oldwebkit == '') {
    svgAngle = svgAngle.replace(/ gradientUnits="userSpaceOnUse"/, '');
  }
  svg += '<linearGradient id="g' + (bl + 1) + '"' + svgAngle + '>\n';
  for (i = 0; i < stopsArray.length; i++) {
    svg += '<stop offset="' + Math.round((parseFloat(stopsArray[i]) / 100) * sr) / sr + '" stop-color="' + fixColor(colorArray[i]) + '"';
    if (colorArray[i].match(/rgba|hsla|transparent/)) {
      svg += ' stop-opacity="' + addStopOpacity(colorArray[i]) + '"';
    }
    svg += '/>\n';
  }
  svg = svg.replace(/offset="0" | stop-opacity="1"/g, '').replace(/offset="0\./g, 'offset=".') + '</linearGradient>\n' + ''; // AM: remove default values and leading zeros when present
  return svg;
}

function fixColor(c) {
  /* AM: To conform to the SVG spec, colors should be CSS2-compatible values, which technically excludes RGBA and HSL/A.
   * This function will convert RGB/A and HSL/A, as well as most valid SVG/CSS3 color names, to hex to not only satisfy the SVG spec,
   * but also make the output SVG more efficient.
   */
  var crgb = '',
    crgbp = '',
    hsl = '';
  if (c.match(/transparent/)) {
    return '#000';
  } else if (c.match(/rgba?|hsla?|[a-z]{8,}|black|white|yellow|fuchsia|magenta/)) {
    /* AM: Browsers don't agree with this (FF and IE for example, render 'transparent' as white), but black follows the CSS3 spec, and Chrome/Safari/Opera follow it.
     * However, the keyword appears to be undefined in the SVG spec, so, this could be a matter up for debate.
     */
    if (c.match(/rgba?/)) {
      if (c.match(/%/)) {
        /* AM: Convert %s to dec. Could simplify "/100*255" to "*2.55", but somehow, that causes a floating point error.
         * For example, 100% will evaluate to 254.99999999999997, which then gets rounded down to 254
         * and thus translates to 'fe' instead of the expected 'ff'. D'oh!
         */
        crgbp = c.match(/(\d+(?:\.\d+)?%)/g);
        crgbp[0] = (parseFloat(crgbp[0]) / 100) * 255;
        crgbp[1] = (parseFloat(crgbp[1]) / 100) * 255;
        crgbp[2] = (parseFloat(crgbp[2]) / 100) * 255;
      }
      (crgb = crgbp == '' ? c.match(/\d{1,3}/g) : crgbp), (cl = crgb.length);
      while (cl--) {
        crgb[cl] = crgb[cl] > 255 ? 255 : crgb[cl];
      }
    } // AM: Cap any errant values over max
    // AM: convert color names larger than 7 letters into hex notation (since the resulting code takes fewer bytes). The additional listed colors will shrink down to 3-digit hex.
    // AM: FF2- and IE8- do not support getComputedStyle, so, those browsers will just return the original input name.
    else if (c.match(/[a-z]{8,}|black|white|yellow|fuchsia|magenta/i) && window.getComputedStyle) {
      var d = document.createElement('div');
      d.style.color = c.match(/[a-z]{8,}|black|white|yellow|fuchsia|magenta/i)[0];
      document.body.appendChild(d);
      crgb = window.getComputedStyle(d, null).color; // AM: returns color in rgb()
      crgb = crgb.replace(/rgb\(/, '').split(', ');
    } else if (c.match(/hsla?/)) {
      hsl = c.match(/(\d{1,3}(?:\.\d+)?)/g);
      hslToRgb(parseFloat(hsl[0]) / 360, parseFloat(hsl[1]) / 100, parseFloat(hsl[2]) / 100); // AM: I don't like the double conversion from HSL to RGB to hex, but I
      crgb = hslToRgb(parseFloat(hsl[0]) / 360, parseFloat(hsl[1]) / 100, parseFloat(hsl[2]) / 100);
    } // couldn't find anything to do a direct HSL to hex conversion. Oh well.
    rgbToHex(parseInt(crgb[0], 10), parseInt(crgb[1], 10), parseInt(crgb[2], 10));
    return '#' + hex;
  } else {
    return c;
  }
}

function addStopOpacity(op) {
  // AM: translate alpha or 'transparent' to stop-opacity
  if (op.match(/rgba|hsla|transparent/)) {
    if (op.match(/(?:\d+(?:\.\d+)?%?,){3}0?(\.\d+)?\)/)) {
      // AM: slightly convoluted syntax to search for a color triplet and capture the alpha decimal value.
      var opv = op.match(/0?(\.\d+)?\)/)[1] ? op.match(/0?(\.\d+)?\)/)[1] : '0'; // AM: for some reason, the regex alone has a hard time returning '0' correctly...
      return opv.replace(/0\./g, '.').replace(/\)/, '');
    } else if (op.match(/transparent/)) {
      return '0';
    } else {
      return '1';
    }
  } else {
    return '';
  }
}

function rgbToHex(r, g, b) {
  // AM: Code adapted from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
  hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  hex = hex.match(/(\w)\1(\w)\2(\w)\3/) ? hex.replace(/(\w)\1(\w)\2(\w)\3/, '$1$2$3') : hex; // AM: If hex can be shrank to 3-digits, then do it. \w searches a-z, A-Z, and 0-9, but generated hex pattern will only have a-f and 0-9.
  return hex;
}

// AM: This function adapted from http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#answer-9493060
function hslToRgb(h, s, l) {
  var r, g, b;
  s = s > 1 ? 1 : s; // AM: Cap values
  l = l > 1 ? 1 : l; // above 1.
  if (s == 0) {
    r = g = b = l;
  } // achromatic
  else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

function finishSVG(svg, bl) {
  svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + units + '" height="' + svgHeight + units + '">\n<defs>\n' + svg + '</defs>\n'; // AM: Safari 5.1 is dumb, requiring the otherwise unneeded defs element for the preview.
  while (bl--) {
    svg += '<rect width="100%" height="100%" fill="url(#g' + (bl + 1) + ')"/>\n';
  }
  svg += '</svg>';
  // Show source code
  document.getElementById('output').value = svg;
  prev.innerHTML = svg; // AM: this one-liner replaces your SVG preview build code
  // AM: Generate base64 output of SVG, usable in CSS as a gradient fallback for IE9.
  if (document.getElementById('b64check').checked) {
    svgToBase64(svg);
  }
}

function svgToBase64(svg) {
  svg = svg.replace(/\n|<\/?defs>/g, ''); // AM: strip new lines and defs element to save bytes. IE9 could also work just fine with original rgba/hsla colors, so,
  var b64output = window.btoa(svg),
    b64text = document.getElementById('base64code'); // keeping those and removing stop-opacity would save around 5-6 more bytes per color-stop, but attempting to do so proved
  b64text.value = b64output;
  b64text.style.cssText = 'display:block'; // too much of a hassle to do and still get correct SVG output. Maybe another time...
  document.getElementById('base64p').style.cssText = 'display:block';
}

function updatePreview() {
  // Get the Height and Width of SVG (not gradient inside SVG) from inside the textarea //
  editHsource = document.getElementById('output').value.match(/height="\d{1,3}(%|px)"/g); // AM: Simplified regex
  editHsource = editHsource.join('');
  editHsource = editHsource.match(/"\d{1,3}?(%|px)"/);
  editHsource = editHsource.join('');
  editHsource = editHsource.replace(/\"/g, '');
  editWsource = document.getElementById('output').value.match(/width="\d{1,3}(%|px)"/g);
  editWsource = editWsource.join('');
  editWsource = editWsource.match(/"\d{1,3}?(%|px)"/);
  editWsource = editWsource.join('');
  editWsource = editWsource.replace(/\"/g, '');
  prev.innerHTML = document.getElementById('output').value;

  // AM: Update base64 output
  if (document.getElementById('b64check').checked) {
    svgToBase64(document.getElementById('output').value);
  }
}

function clearInput(b) {
  if (document.getElementById('clearit').checked.value == '1') {
    this.value = '';
  }
}
