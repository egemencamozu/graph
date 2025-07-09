import { TestBed } from '@angular/core/testing';

import { ChatbotService } from './chatbot-service.service';

describe('ChatbotServiceService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
