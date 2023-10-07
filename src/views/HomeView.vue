<script lang="ts">
import { defineComponent } from 'vue'
import { useUserStore } from '@/stores/index'
import axios from "axios";
import draggable from "vuedraggable";

import { type Cards } from "@/intefaces/Cards";


interface State {
  raw: Cards[],
  work: Cards[],
  completed: Cards[],
  draggable: Boolean,
  url: String,
  form: {
          name: String, 
          first_name: String,
          phone: String,
          email: String, 
          price: String, 
          type: String, 
          product: String, 
          comment: String
        }
}

export default defineComponent ({
  setup() {
    const userStore = useUserStore()
    return {userStore}
  },
  components: {draggable},
    data(): State {
        return {
        raw: [],
        work: [],
        completed: [],

      draggable: false,
      // Это моё REST API
      url: 'https://we-game-api.onrender.com/api/tasks/',
      form: {
          name: '', 
          first_name: '',
          phone: '',
          email: '', 
          price: '', 
          type: '', 
          product: '', 
          comment: ''
        }
      };
    },
    methods: {
      async updateTask(element: Cards, completed?:Number) {
        console.log('updateTask element', element)
        await axios.put(this.url, {
          id: element.id, 
          name: element.name, 
          first_name: element.first_name,
          phone: element.phone,
          email: element.email, 
          price: element.price, 
          type: element.type, 
          product: element.product, 
          comment: element.comment,
          completed: completed ? completed : element.completed,
          checked: element.checked
        })
        this.getTasks()
      },
      async addTask() {
        await axios.post(this.url, {
          name: this.form.name.length === 0 ? 'Не указан' : this.form.name, 
          first_name: this.form.first_name.length === 0 ? 'Не указан' : this.form.first_name,
          phone: this.form.phone ? this.form.phone : '00000000000',
          email: this.form.email.length === 0 ? 'Не указан' : this.form.email, 
          price: this.form.price ? this.form.price : 0, 
          type: this.form.type ? 'Не указан' : this.form.type, 
          product: this.form.product.length === 0 ? 'Не указан' : this.form.product, 
          comment: this.form.comment.length === 0 ? 'Не указан' : this.form.comment
        })
        this.emptyForm()
        this.getTasks()
      },
      emptyForm() {
        this.form.name = '' 
        this.form.first_name = ''
        this.form.phone = ''
        this.form.email = '' 
        this.form.price = '' 
        this.form.type = '' 
        this.form.product = '' 
        this.form.comment = ''      
      },
      onEdit(element: Cards) {
        element.edit = !element.edit
        if(!element.edit) {
          this.updateTask(element)
        }
      },
      clearData() {
        this.raw = []
            this.work =[]
            this.completed = [] 
      },
      async getTasks() {
        const res = await axios.get(this.url)
        console.log('getTasks', res.data)
        this.clearData()

        res.data.forEach((val: Cards) => {
          if(val.completed === 0) {
            this.raw.push(val)
          } else if(val.completed === 1) {
            this.work.push(val)
          } else {
            this.completed.push(val)
          }
        });
      },
      async onDelete(val: Cards) {
        const res = await axios.delete(this.url+val.id)
        this.getTasks()
        console.log('onDelete', val)
      },
      log: function(evt: Object) {
        if(evt.removed) {
          this.raw.forEach((val: Cards) => {
            this.updateTask(val, 0)
            console.log('this.moveCard(val, 0)')
          })
          this.work.forEach((val: Cards) => {
            this.updateTask(val, 1)
            console.log('this.moveCard(val, 1)')
          })
          this.completed.forEach((val: Cards) => {
              this.updateTask(val, 3)
          })
        }
        window.console.log('log', evt);
      },
      onSort() {
        this.completed.reverse()
      }
    },
    watch: {
    },
    mounted() {
      this.getTasks()
    }
})
</script>

<template>
  <div class="container">
    <div class="form">
      <div class="block">
        <span>Имя</span>
        <input v-model="form.name" placeholder="Введите имя"/>
      </div>
      <div class="block">
        <span>Исполнитель</span>
        <input v-model="form.first_name" placeholder="Введите исполнителя"/>
      </div>
      <div class="block">
        <span>Номер телефона</span>
        <input v-model="form.phone" placeholder="Введите телефон"/>
      </div>
      <div class="block">
        <span>Email</span>
        <input v-model="form.email" placeholder="Введите Email"/>
      </div>
      <div class="block">
        <span>Цена</span>
        <input v-model="form.price" placeholder="Введите цену"/>
      </div>
      <div class="block">
        <span>Тип оплаты</span>
        <input v-model="form.type" placeholder="Введите тип оплаты"/>
      </div>
      <div class="block">
        <span>Продукт</span>
        <input v-model="form.product" placeholder="Введите продукт"/>
      </div>
      <div class="block">
        <span>Комментарий</span>
        <input v-model="form.comment" placeholder="Введите комментарий" maxlength="20"/>
      </div>
      <button @click="addTask" class="btn">Добавить</button>
    </div>
    <div class="row">
    <div class="col-3 raw">
      <h4>Необработанные <span class="circle">{{ raw.length }}</span></h4>
      <draggable :class="draggable" class="list-group" :list="raw" group="people" @change="log">
        <template #item="{ element }">
          <div class="list-group-item">
            <div>
              <span>ID: </span>
              <span>{{ element.id }}</span>
            </div>
            <div>
              <span>Имя: </span>
              <span class="text">{{ element.name }}</span>
            </div>
            <div>
              <span>Тел: </span>
              <span class="text">{{ element.phone }}</span>
            </div>
            <div>
              <span>e-mail: </span>
              <span class="text">{{ element.email }}</span>
            </div>
            <div>
              <span>Цена: </span>
              <span class="text">{{ element.price }}</span>
            </div>
            <div>
              <span>Создан: </span>
              <span class="text">{{ element.created_at.split('T')[0] + ' ' + element.created_at.split('T')[1].replace(/\..+Z/, '') }}</span>
            </div>
            <div>
              <span>Тип оплаты: </span>
              <span class="text">{{ element.type }}</span>
            </div>
            <div>
              <span>Продукты: </span>
              <span class="text">{{ element.product }}</span>
            </div>
            <button @click="updateTask(element, 1)" class="btn">Взять в работу</button>
          </div>
        </template>
      </draggable>
    </div>

    <div class="col-3 work">
      <div>
        <h4>В работе <span class="circle">{{ work.length }}</span></h4>
      </div>
      <draggable :class="draggable" class="list-group" :list="work" group="people" @change="log">
        <template #item="{ element }">
          <div class="list-group-item">
            <div>
              <span>ID: </span>
              <span>{{ element.id }}</span>
            </div>
            <div>
              <span class="svg"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg> </span>
              <span>{{ element.first_name }}</span>
            </div>
            <div>
              <span>Создан: </span>
              <span class="text">{{ element.created_at.split('T')[0] + ' ' + element.created_at.split('T')[1].replace(/\..+Z/, '') }}</span>
            </div>
            <div>
              <span>Цена: </span>
              <span class="text">{{ element.price }}</span>
            </div>
            <div>
              <span>Имя: </span>
              <span class="text">{{ element.name }}</span>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <div class="col-3 completed">
      <div class="filter">
        <h4>Завершенные <span class="circle green">{{ completed.filter(val => val.checked).length }}</span><span class="circle red">{{ completed.filter(val => !val.checked).length }}</span></h4>
        <svg @click="onSort" fill="#025dfd" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
      </div>
      <draggable :class="draggable" class="list-group" :list="completed" group="people" @change="log">
        <template #item="{ element }">
            <div class="list-group-item completed" :class="{green: element.checked === 'true' ? true : false}">
              <div class="card_finish" v-if="!element.edit">
                <div>
                  <span>ID: </span>
                  <span>{{ element.id }}</span>
                </div>
                <div>
                  <span class="svg"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg> </span>
                  <span>{{ element.first_name }}</span>
                </div>
                <div>
                  <span>Имя: </span>
                  <span class="text">{{ element.name }}</span>
                </div>
                <div>
                  <span>Цена: </span>
                  <span class="text">{{ element.price }}</span>
                </div>
                <div>
                  <span>Создан: </span>
                  <span class="text">{{ element.created_at.split('T')[0] + ' ' + element.created_at.split('T')[1].replace(/\..+Z/, '') }}</span>
                </div>
                <div>
                  <span>Комментарий: </span>
                  <span class="text">{{ element.comment }}</span>
                </div>
              </div>
              <div class="card_finish" v-else>
                <div>
                  <span>ID: </span>
                  <span>{{ element.id }}</span>
                </div>
                <div>
                  <span class="svg"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg> </span>
                  <input v-model="element.first_name"/>
                </div>
                <div>
                  <span>Имя: </span>
                  <input v-model="element.name"/>
                </div>
                <div>
                  <span>Цена: </span>
                  <input v-model="element.price"/>
                </div>
                <div>
                  <span>Создан: </span>
                  <span class="text">{{ element.created_at.split('T')[0] + ' ' + element.created_at.split('T')[1].replace(/\..+Z/, '') }}</span>
                </div>
                <div>
                  <span>Комментарий: </span>
                  <input v-model="element.comment"/>
                </div>
                <div>
                  <span>Готово: {{ element.checked }}</span>
                  <input type="checkbox" v-model="element.checked" />
                </div>
              </div>
              <svg @click="onEdit(element)" class="svg_icon edit pointer" fill="#fff" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/></svg>
              <svg @click="onDelete(element)" class="svg_icon pointer" fill="#FF0000" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </div>

        </template>
      </draggable>
    </div>
  </div>
  </div>
</template>
<style scoped>
.pointer {
  cursor: pointer;
  margin: 0px 4px;
}
.filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter svg {
  cursor: pointer;
}
.card_finish div {
  display: flex; 
  align-items: center;
}
.card_finish input {
  margin-left: 5px;
  width: 80%;
  padding: 2px 4px;
  border: none;
  border-radius: 6px;
  outline: none;
}
.card_finish input[type=checkbox] {
    /* Add if not using autoprefixer */
    -webkit-appearance: none;
  appearance: none;
  /* For iOS < 15 to remove gradient background */
  background-color: #fff;
  /* Not removed via appearance */
  display: grid;
  place-content: center;
  appearance: none;
  background-color: #fff;
  margin-left: 10px;
  font: inherit;
  color: currentColor;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 0.15em;
  transform: translateY(-0.075em);
}
.card_finish input[type=checkbox]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(#959495);
  transform-origin: bottom left;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background-color: CanvasText;
}
.card_finish input[type=checkbox]:checked::before  {
  transform: scale(1);
}

.block {
  display: flex;
  flex-direction: column;
  margin: 5px 0px;
}
.block input {
  width: 40%;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
}
.list-group-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  position: relative;
}
.list-group-item .svg_icon {
  position: absolute;
  right: 0px;
  top: 4px;
}
.list-group-item .svg_icon.edit {
  right: 24px;
}
.svg {
  margin-right: 5px;
}
.list-group-item div {
  margin-right: auto;
  margin-bottom: 5px;
}
.list-group-item .text {
  font-weight: normal;
}
.list-group-item.completed {
  background-color: #ff9a99;
  border-color: #ff9a99;
  color: white;
  display: flex;
  flex-direction: row;
  align-items: start;
}
.list-group-item.completed.green {
  background-color: #9dde97;
  border-color: #9dde97;
}
.circle {
  color: black;
  border-radius: 50%;
  padding: 4px 10px;
  padding-top: 2px;
  font-size: 16px;
  background-color: white;
}
.circle.green {
  background-color: #9dde97;
  color: white;
  font-weight: bold;
  margin-right: 6px;
}
.circle.red {
  background-color: #ff9a99;
  color: white;
  font-weight: bold;
}

.col-3 {
  padding: 20px 30px;
  border-radius: 10px;
  margin: 0px 10px;
  color: white;
}
.col-3.raw {
  background-color: #bae2ff;
}
.col-3.work {
  background-color: #ffe2ab;
}
.col-3.completed {
  background-color: #ffc7c7;
}
.list-group-item, .list-group {
  margin: 10px 0px ;
}
.list-group {
  border-radius: 8px; 
}
.btn {
  background-color: #035efe;
  color: white;
  font-weight: bold;
  border-radius: 100px;
  width: 160px;
  margin: 10px 0px;
}
.btn:hover {
  background-color: #3b83ff;
  color: white;
}
</style>