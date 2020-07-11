---
twitterTitle: "Wenn Männner über Männer reden, reden Männer Männern nach"
twitterDescription: >-
  Schluss mit Scheinargumenten: Sprache, die nur Männer sichtbar macht, hat
  reale Konsequenzen – nicht nur für Frauen.
slug: wenn-maennner-ueber-maenner-reden-reden-maenner-maennern-nach
subject: ""
facebookTitle: "Wenn Männner über Männer reden, reden Männer Männern nach"
gallery: false
title: "Wenn Männner über Männer reden, reden Männer Männern nach"
template: article
image: images/3e6f56832f7dafe58f2e10edffeb908423a50122.jpeg?size=1500x750
description: >-
  Gendergerechte Sprache wird gerne als unnötige Zwängerei abgetan. Aber
  Sprache, die nur Männer sichtbar macht, hat reale Konsequenzen – nicht nur für
  Frauen.
feed: true
---

<section><h6>TITLE</h6>

# Wenn Männner über Männer reden, reden Männer Männern nach

## 

Gendergerechte Sprache wird gerne als unnötige Zwängerei abgetan. Aber Sprache, die nur Männer sichtbar macht, hat reale Konsequenzen – nicht nur für Frauen.

Von Peter Parker, 12.06.2020

<hr /></section>

<section><h6>CENTER</h6>

Starten wir mit einem Stimmungsbild:

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-gender",
    "hideAnonymize": true,
    "settings": [
      {
        "order": 0,
        "colors": {
          "empty": "#ffffff",
          "min": "#FBFBFB",
          "max": "#EBECEB",
          "clusters": ["#fbfbfb", "#f7f7f7", "#f3f3f3", "#efefef", "#eaeaea", "#e6e6e6", "#e2e2e2", "#dedede", "#dadada", "#d6d6d6"],
          "answer": "#048e02"
        },
        "slider": {
          "step": 0.001
        },
        "augments": [
          {
            "path": "[0].userAnswer.payload.value",
            "color": "#048e02",
            "label": "Ihre Position"
          },
          {
            "path": "[0].rangeResults.median",
            "color": "#ba5968",
            "label": "Mittelwert"
          }
        ]
      },
      {
        "order": 1,
        "hide": true
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

Kommen wir zum Schluss nochmals auf das Stimmungs­bild zurück: Hat sich etwas verändert?

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-gender",
    "settings": [
      {
        "order": 0,
        "hide": true
      },
      {
        "order": 1,
        "colors": {
          "empty": "#ffffff",
          "min": "#FBFBFB",
          "max": "#EBECEB",
          "clusters": ["#fbfbfb", "#f7f7f7", "#f3f3f3", "#efefef", "#eaeaea", "#e6e6e6", "#e2e2e2", "#dedede", "#dadada", "#d6d6d6"],
          "answer": "#048e02"
        },
        "slider": {
          "initial": {
            "path": "[0].userAnswer.payload.value"
          },
          "step": 0.001
        },
        "augments": [
          {
            "path": "[1].userAnswer.payload.value",
            "color": "#048e02",
            "label": "Ihre neue Position"
          },
          {
            "path": "[1].rangeResults.median",
            "color": "#ba5968",
            "label": "Neuer Mittelwert"
          },
          {
            "path": "[0].userAnswer.payload.value",
            "color": "#B1D2B0"
          },
          {
            "path": "[0].rangeResults.median",
            "color": "#E3C9CD"
          }
        ]
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

A big one.

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-gender",
    "colors": [
      {
        "value": true,
        "color": "#6FB977"
      },
      {
        "value": false,
        "color": "#AD8BBD"
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-demokratie",
    "colors": [
      {
        "value": true,
        "color": "#6FB977"
      },
      {
        "value": false,
        "color": "#AD8BBD"
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

Andere Komponente:

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-vaterschaftsurlaub"
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

<hr /></section>