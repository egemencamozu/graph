import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChatMessage,
  GraphData,
  QueryInfo,
  RAGResponse,
} from '../../models/chatbot.model';
import { ChatbotService } from '../../services/chatbot-service.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('chatMessages') chatMessagesRef!: ElementRef;
  @ViewChild('chatInput') chatInputRef!: ElementRef;
  @ViewChild('chatPanel') chatPanelRef!: ElementRef;
  @ViewChild('chatToggle') chatToggleRef!: ElementRef;

  private statusTimeout: any;

  // Component State
  isOpen = false;
  isTyping = false;
  isSending = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  lastQueryInfo: QueryInfo | null = null;

    constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    console.log('🤖 Chatbot component initialized');
    this.initializeWelcomeMessage();

    // ✅ createRAGGraph fonksiyonunu global window objesine ekle
    (window as any).createRAGGraph = (graphData: GraphData, ragResponse: RAGResponse) => {
      // Buraya gerçek görselleştirme kodunu ekleyebilirsin
      // Örnek olarak sadece konsola yazalım:
      console.log('🎯 [createRAGGraph] GraphData:', graphData);
      console.log('🎯 [createRAGGraph] RAGResponse:', ragResponse);
      // İleride D3.js, vis.js, vb. kodunu buraya ekleyebilirsin
      return Promise.resolve();
    };
  }

  ngOnDestroy(): void {
    // Cleanup
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
  }

  private initializeWelcomeMessage(): void {
    this.addMessage('Merhaba! Size nasıl yardımcı olabilirim?', 'bot');
  }

  // 🎛️ Panel Control Methods
  toggleChatbot(): void {
    this.isOpen = !this.isOpen;
    console.log('🤖 Chatbot toggled:', this.isOpen ? 'opened' : 'closed');

    if (this.isOpen) {
      setTimeout(() => {
        if (this.chatInputRef?.nativeElement) {
          this.chatInputRef.nativeElement.focus();
        }
      }, 300);
    }
  }

  closeChatbot(): void {
    this.isOpen = false;
    console.log('🤖 Chatbot closed');
  }

  // 📝 Message Handling
  onKeyPress(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !this.isSending &&
      this.currentMessage.trim()
    ) {
      this.sendMessage();
    }
  }

  async sendMessage(): Promise<void> {
    const message = this.currentMessage.trim();
    if (!message || this.isSending) return;

    console.log('🤖 Sending message:', message);

    // Add user message
    this.addMessage(message, 'user');
    this.currentMessage = '';
    this.isSending = true;

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // 🤖 RAG Query - Sadece gerçek API
      console.log('🤖 Sending RAG query:', message);
      const ragResponse = await this.chatbotService.queryChatBotRAG(message);
      console.log('✅ RAG Response received:', ragResponse);

      this.hideTypingIndicator();

      if (ragResponse && ragResponse.hasResults && ragResponse.data.length > 0) {
        // ✅ RAG sonuçları bulundu
        const graphData = this.chatbotService.processRAGResults(ragResponse, message);
        console.log('📊 Graph data processed:', graphData);

        // Graph'ı güncelle (window scope'daki fonksiyonu çağır)
        await this.createRAGGraph(graphData, ragResponse);

        this.addMessage(
          `✅ Found ${graphData.metadata.resultCount} results! I've updated the graph to show them.`,
          'bot'
        );
        this.addMessage(`🔍 Query executed: "${ragResponse.gremlin}"`, 'bot');

        // Success status
        this.updateQueryStatus(
          true,
          `Found ${graphData.metadata.resultCount} results`,
          graphData.metadata.resultCount,
          ragResponse.gremlin
        );
      } else {
        // ❌ RAG sonuç yok
        this.addMessage(`❌ No results found for: "${message}"`, 'bot');
        if (ragResponse && ragResponse.gremlin) {
          this.addMessage(`🔍 Query executed: "${ragResponse.gremlin}"`, 'bot');
        }

        // Error status
        this.updateQueryStatus(
          false,
          'No results found',
          0,
          ragResponse?.gremlin
        );
      }
    } catch (error) {
      console.error('❌ RAG Query failed:', error);
      this.hideTypingIndicator();

      // Sadece hata mesajı - fallback yok
      this.addMessage('❌ API connection failed. Please try again.', 'bot');

      // Error status
      this.updateQueryStatus(false, 'API connection failed', 0);
    } finally {
      this.isSending = false;
    }
  }

  private addMessage(text: string, sender: 'user' | 'bot'): void {
    this.messages.push({
      text,
      sender,
      timestamp: new Date(),
      id: `${sender}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Scroll to bottom after view update
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private updateQueryStatus(
    success: boolean,
    message: string,
    resultCount?: number,
    gremlinQuery?: string
  ): void {
    // Önceki timeout'u temizle
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    this.lastQueryInfo = {
      success,
      message,
      resultCount,
      gremlinQuery,
      timestamp: new Date(),
    };

    // Status'u 5 saniye sonra temizle
    this.statusTimeout = setTimeout(() => {
      this.lastQueryInfo = null;
    }, 5000);
  }

  private showTypingIndicator(): void {
    this.isTyping = true;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private hideTypingIndicator(): void {
    this.isTyping = false;
  }

  private scrollToBottom(): void {
    if (this.chatMessagesRef?.nativeElement) {
      const element = this.chatMessagesRef.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private async createRAGGraph(
    graphData: GraphData,
    ragResponse: RAGResponse
  ): Promise<void> {
    try {
      if (typeof (window as any).createRAGGraph === 'function') {
        await (window as any).createRAGGraph(graphData, ragResponse);
        console.log('✅ Graph updated successfully');
      } else {
        // Sadece uyarı ve kullanıcıya mesaj göster
        console.error('⚠️ createRAGGraph function not found on window');
        this.addMessage('⚠️ Graph visualization not available', 'bot');
      }
    } catch (error) {
      console.error('❌ Error creating RAG graph:', error);
      this.addMessage('❌ Error updating graph visualization', 'bot');
    }
  }

  // 🖱️ Outside Click Handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isOpen && this.chatPanelRef && this.chatToggleRef) {
      const target = event.target as HTMLElement;

      // Overlay'e tıklanmışsa kontrol et
      if (target.classList.contains('chatbot-overlay')) {
        this.closeChatbot();
        return;
      }

      // Chat panel veya toggle butonuna tıklanmışsa kapanmasın
      const clickedInside =
        this.chatPanelRef.nativeElement.contains(target) ||
        this.chatToggleRef.nativeElement.contains(target);

      if (!clickedInside) {
        this.closeChatbot();
      }
    }
  }
}
