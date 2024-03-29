---
title: 'Fragenbogen-Komponente in verschiedenen Ausführungen'
feed: true
---

<section><h6>TITLE</h6>

# Fragen fragen

##

Eine Fragebogen-Komponente kann mit Daten aus der query «questionnaire» umgehen und stellt die eigene Antwort im Vergleich zu anderen dar. Sie kann Fragen vom Typ «choice» und «range» darstellen, Antworten an Server schicken und einmal verschickte Daten anonymisieren.

Von Peter Parker, 12.06.2020

<hr /></section>

<section><h6>CENTER</h6>

## Komponente

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-klimabeitrag",
    "translations": [
      {
        "key": "questionnaire/question/0/text",
        "value": "Wie viel wären Sie bereit für einen solchen Dienst auszugeben?"
      },
      {
        "key": "questionnaire/question/0/range/submit",
        "value": "{value} Franken speichern"
      },
      {
        "key": "questionnaire/question/0/range/tick/first",
        "value": "nichts"
      },
      {
        "key": "questionnaire/question/0/range/tick/last",
        "value": "1000 Franken und mehr"
      }
    ],
    "settings": [
      {
        "order": 0,
        "colors": {
          "min": "#fbfbfb",
          "max": "#d6d6d6"
        },
        "colorsDark": {
          "min": "#232323",
          "max": "#757575"
        },
        "slider": {
          "step": 1
        },
        "augments": [
          {
            "path": "[0].userAnswer.payload.value",
            "color": "#048e02",
            "colorDark": "#00AA00",
            "label": "{value} Franken (Sie)"
          },
          {
            "path": "[0].rangeResults.median",
            "color": "#ba5968",
            "label": "{value} Franken (Mittelwert)"
          }
        ]
      }
    ]
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

## Komponenten-Fehler

Fragebogen ist nicht aufzufinden:

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "fake-slug"
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

## Fragebogen mit zwei Fragen in zwei Komponenten

Erste Frage in einer Komponente …

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

… und später die zweite Frage in einer weitere Komponente.

Hier wird die erste Antwort über _settings[].augments_ mit übernommen.

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

## Komponente ohne Konfguration

Komponenten rendert alle Fragen:

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-gender"
  },
  "src": "https://cdn.republik.space/s3/republik-assets/dynamic-components/questionnaire/index.js"
}
```

<hr /></section>

## Fragebogen mit choice-Fragen

<section><h6>DYNAMIC_COMPONENT</h6>

```
{
  "autoHtml": false,
  "props": {
    "slug": "mss-russland",
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
