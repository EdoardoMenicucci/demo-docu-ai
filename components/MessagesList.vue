<template>
  <!-- CHAT -->
  <div v-if="messages" v-for="res in messages" class="chat-area">
    <div class="flex mx-5" :class="{ 'justify-end': res.user === 'USER' }">
      <div class="w-3/4 relative text-white bg-dark-gray-900 p-5 rounded-xl border-dark-gray-500 border-2 m-4 order-1"
        :class="{ 'order-2': res.user === 'AI' }">


        <!-- IF USER NO MARKDOWN -->
        <div v-if="res.user === 'USER' && res.text != ''" class="">
          {{ res.text }}
        </div>
        <!-- Aggiungi fallback per debug -->
        <div v-else-if="res.text">
          <MDC :value="res.text" tag="div" />
          <!-- Debug output -->
          <!-- <pre class="text-xs mt-2">DEBUG OUTPUT: {{ res.text }}</pre> -->
        </div>
        <div v-else>Nessun contenuto</div>
        <!-- DEBUG END -->


        <UBadge class="absolute -top-3" :class="{ 'left-1': res.user === 'USER', 'right-1': res.user === 'AI' }">
          {{ res.date }}
        </UBadge>
      </div>
      <UIcon name="material-symbols:account-circle-outline" class="text-dark-gray-200 order-2" mode="svg"
        v-if="res.user === 'USER'" size="2em" />
      <UIcon v-else name="mdi:robot-outline" class="text-dark-gray-200 order-1" mode="svg" size="2em" />


    </div>

  </div>
  <UProgress v-if="isWaitingMessage" animation="swing" class="w-3/4 mx-auto mb-5" />
</template>

<script lang="ts" setup>

import { useChatStore } from '~/stores/useChatStore';
import { storeToRefs } from 'pinia';


const chatStore = useChatStore();
const { messages, isWaitingMessage } = storeToRefs(chatStore);



</script>

<style></style>