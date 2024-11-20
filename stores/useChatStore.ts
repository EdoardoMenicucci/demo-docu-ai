import { defineStore } from 'pinia'
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Tipi e Interfaccie
 */

export interface FileType {
  id: number;
  chatId: number | null;
  userId: number;
  createdAt: string;
  fileName: string | null;
  fileUrl: string;
  status: string;
}

export type Sender = 'USER' | 'AI';

export interface Message {
  text: string;
  user: Sender;
  date: string;
}


export interface ChatState {
  pdfUrl: string;
  fileSet: boolean;
  promptUtente: string;
  messages: Message[];
  isUploading: boolean;
  leftAppBarShow: boolean;
  isSendingMessages: boolean
  userApiKey: string
}



export const useChatStore = defineStore({
  id: 'chatStore',

  state: (): ChatState => ({
    pdfUrl: '',
    fileSet: false,
    promptUtente: '',
    messages: [],
    isUploading: false,
    leftAppBarShow: true,
    isSendingMessages: false,
    userApiKey: typeof window !== 'undefined' ? sessionStorage.getItem('gemini_api_key') || '' : '',
  }),

  actions: {
    /**
     * Gestione API Key 
     * @param key 
     */
    setApiKey(key: string) {
      this.userApiKey = key
      if (typeof window !== 'undefined') {
        if (key && key.trim().length >= 30) {
          sessionStorage.setItem('gemini_api_key', key)
        } else {
          sessionStorage.removeItem('gemini_api_key')
        }
      }
    },

    clearApiKey() {
      this.userApiKey = ''
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gemini_api_key')
      }
    },
    /**
     * Al caricamento di un file, invia il file al server e inizia una nuova chat
     * @param file 
     */
    async handleChange(file: any) {
      this.handleReset();
      const fileUrl = URL.createObjectURL(file);
      this.pdfUrl = fileUrl
    },

    handleSendMessage(message: string) {
      this.promptUtente = message;
      if (this.pdfUrl) {
        this.isSendingMessages = true
        this.sendMessage();
      } else {
        this.fileSet = true;
        console.error('Devi prima caricare un file');
      }
    },

    handleReset() {
      this.promptUtente = '';
      this.messages = [];
      this.pdfUrl = '';
    },

    toggleLeftAppBar() {
      this.leftAppBarShow = !this.leftAppBarShow;
    },
    /**
     * Invia un messaggio e riceve la risposta dell'IA
     */
    async sendMessage() {
      try {
        this.addMessage(this.promptUtente, 'USER');

        // Leggi il file usando fetch
        const response = await fetch(this.pdfUrl);
        const blob = await response.blob();

        // Converti il blob in base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });

        const genAI = new GoogleGenerativeAI(this.userApiKey ?? '');
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: `1. Estrai i concetti più importanti sintetizzando il contenuto del documento.
            2. Non inventare nulla.
            3. Rispondi in formato Markdown .md per la formattazione e enfasi del testo.
            4. Se ci sono richieste dall'utente rispondi solamente alla richiesta dell utente.`,
        });

        try {
          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64 as string
              }
            },
            { text: this.promptUtente }
          ]);


          const res = result.response.text();
          this.addMessage(res, 'AI');
          console.log('Risposta:', res);

        } catch (error) {
          let errorMessage = 'Si è verificato un errore durante la generazione della risposta.';
          if ((error as Error).message?.includes('503') || (error as Error).message?.includes('overloaded')) {
            errorMessage = '⚠️ Il modello è sovraccarico. Per favore riprova tra qualche minuto.';
          }
          this.addMessage(errorMessage, 'AI');
        }

      } catch (error) {
        const errorMessage = '❌ Si è verificato un errore inaspettato. Per favore riprova.';
        this.addMessage(errorMessage, 'AI');
        console.error('Errore durante l\'invio del messaggio:', error);
      } finally {
        this.isSendingMessages = false
      }
    },

    /**
     * Aggiunge un messaggio utente alla lista dei messaggi a schermo
     * @param userMessage 
     */
    addMessage(userMessage: string, sender: Sender) {
      this.messages = [
        ...this.messages,
        {
          text: userMessage,
          user: sender,
          date: timestampToDate(new Date())
        }
      ] as Message[];
    }
  },
  getters: {
    isWaitingMessage: (state) => state.isSendingMessages,
    currentMessages: (state) => state.messages,
    currentPdfUrl: (state) => state.pdfUrl
  }
})
