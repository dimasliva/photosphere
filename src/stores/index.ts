import { type User } from "@/intefaces/User";
import { defineStore } from 'pinia'

export type UserState = {
  user: User,
  url: String
};

export const useUserStore = defineStore({
  id: "mainStore",
  state: () =>
    ({
      user: {
        user: '',
        password: '',
        name: '',
        role: ''
      },
      // url если нужно запустить на gh-pages
      // url: 'https://my-json-server.typicode.com/dimasliva/fuse8_json_server/'
      // url если нужно запустить локально
      url: window.location.protocol + '//' + window.location.hostname + ':3001/'
    } as UserState),
    actions: {
      setUser(user: User) {
        this.user = user
      },
  }
})
