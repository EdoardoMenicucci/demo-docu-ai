<template>
  <div class="w-[20rem] bg-dark-gray-900 pt-5 flex-shrink-0 flex flex-col ">
    <NuxtLink to="/" class="" @click="userApiKey = ''">
      <div class="flex w-full hover:bg-dark-gray-800 py-2 items-center ps-2">
        <UIcon name="material-symbols-light:arrow-back-rounded" class="text-dark-gray-200 mx-1" mode="svg"
          size="1.5em" />
        <div class="font-thin">
          Back
        </div>
      </div>
    </NuxtLink>
    <NuxtLink class="" @click="handleReset">
      <div class="flex w-full hover:bg-dark-gray-800 py-2 items-center ps-2">
        <UIcon name="material-symbols-light:delete-sweep-outline" class="text-dark-gray-200 mx-1" mode="svg"
          size="1.5em" />
        <div class="font-extralight">
          Reset
        </div>
      </div>
    </NuxtLink>

  </div>
</template>

<script lang="ts" setup>
const chatStore = useChatStore();
const { userApiKey } = storeToRefs(chatStore);

const emit = defineEmits(['reset']);

// Handle Emits
const handleReset = () => {
  emit('reset');
};

</script>

<style></style>