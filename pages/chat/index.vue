<template>
  <div class="bg-dark-gray-800">
    <div class="mx-auto h-screen flex flex-shrink">

      <!-- Left section -->
      <LeftAppBar :class="{ '': leftAppBarShow == true }" v-if="leftAppBarShow == true"
        @reset="chatStore.handleReset" />


      <ChatBody />


      <!-- If no file selected Modal -->
      <UModal v-model="fileSet">
        <div class="p-4">
          <p class="text-center">Seleziona un file PDF per inviare un messaggio</p>
        </div>
      </UModal>

      <!-- Right section -->
      <!-- 90vh overflow Chat Body -->



    </div>
  </div>

</template>

<script lang="ts" setup>
import { useChatStore } from '~/stores/useChatStore';
const chatStore = useChatStore();
const { fileSet, userApiKey } = storeToRefs(chatStore);
const router = useRouter();


onMounted(() => {
  if (!userApiKey.value || userApiKey.value.trim().length < 30) {
    router.push('/');
  }
});


watch(userApiKey, (newValue) => {
  if (!newValue || newValue.trim().length < 30) {
    router.push('/');
  }
});

const leftAppBarShow = ref<boolean>(true);

const toggleLeftAppBar = () => {
  leftAppBarShow.value = !leftAppBarShow.value;
}



</script>

<style scoped></style>