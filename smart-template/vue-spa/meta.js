module.exports = {
  "prompts": {
      "name": {
          "type"    : "string",
          "required": false,
          "message" : "Project name",
          "default" : "vue-spa"
      },
      "author": {
          "type"   : "string",
          "message": "Author"
      },
      "version": {
          "type"    : "string",
          "message" : "Project version",
          "default" : "1.0.0"
      },
      "description": {
          "type"    : "string",
          "required": false,
          "message" : "Project description",
          "default" : "A new Vue.js project"
      },
      "router": {
        "type": 'confirm',
        "message": 'Install vue-router?'
      },
      "state": {
          "type": "list",
          "message": "state manage for your app",
          "choices": [
              {
                "name": "Revuejs (https://github.com/dwqs/revuejs)",
                "value": "revue",
                "short": "revue"
              },
              {
                "name": "Vuex (https://github.com/vuejs/vuex)",
                "value": "vuex",
                "short": "vuex"
              },
              {
                "name": "Mobx (https://github.com/mobxjs/mobx)",
                "value": "mobx",
                "short": "mobx"
              }
          ]
      },
      "port": {
          "type"    : "string",
          "required": false,
          "message" : "client port",
          "default" : 3000
      },
      "prefix": {
          "type"    : "string",
          "required": false,
          "message" : "the host name for Ajax request",
          "default" : ''
      }
  },
  "filters": {
     "src/vuex/**/*": "state === 'vuex'",
     "src/modules/**/*": "state === 'revue'",
     "src/mobx/**/*": "state === 'mobx'"
  },
  "completeMessage": "To get started:\n\n  cd {{destDirName}}\n  npm install\n  npm run dev\n\nDocumentation can be found at https://github.com/dwqs/vue-startup"
}