<template>
  <div class="flex w-1/2 bg-black  border-dark-gray-700 rounded-md border mt-1">
    <input type="text" v-model="apiKey" placeholder="Inserisci la tua API KEY"
      class="w-full p-1 m-1 bg-transparent outline-none focus:outline-none"
      @keyup.enter="chatStore.setApiKey(apiKey)" />
    <button class="px-2" @click="chatStore.setApiKey(apiKey)">SET</button>
  </div>
</template>

<script lang="ts" setup>
const chatStore = useChatStore();

const { userApiKey } = storeToRefs(chatStore);
const apiKey = ref<string>('');

const router = useRouter();

watch(userApiKey, (newValue) => {
  if (newValue && newValue.trim().length > 30) {
    router.push('/chat');
  }
});
</script>

<style></style>