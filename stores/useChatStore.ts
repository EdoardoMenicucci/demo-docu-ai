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
          systemInstruction: `1. Estrai i concetti più importanti sintetizzando il contenuto del documento se non ci sono richieste dall'utente.
            2. Non inventare nulla.
            3. Applica le classi di Tailwind CSS per aggiungere stile ed enfatizzare i contenuti più importanti (il testo deve essere bianco/chiaro) non utilizzare apertura '''html e chiusura '''`,
        });

        try {
          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64 as string
              }
            },
            { text: this.promptUtente ?? '' }
          ]);


          const res = result.response.text();
          this.addMessage(res, 'AI');
        } catch (error) {

          // Se il modello è sovraccaricato
          if ((error instanceof Error) && error.message.includes('503')) {
            console.error('[503 ] The model is overloaded. Please try again later.:', error.message);
            this.addMessage(`⚠️Il modello e' sovraccaricato, Riprova piu' tardi⚠️`, 'AI');
          }

          // Se la chiavi API non è valida
          if ((error instanceof Error) && (error.message.includes('400') || error.message.includes('401'))) {
            console.error('[401 ] Unauthorized. Please check your API key:', error.message);
            this.addMessage(`⚠️Non autorizzato. Controlla la tua chiave API e premi Back per reimpostarla⚠️`, 'AI');
          }


        }

      } catch (error) {
        // Errore generico
        console.error('Errore durante l\'invio del messaggio:', error);
        this.addMessage(`⚠️Errore durante l'invio del messaggio⚠️`, 'AI');
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
