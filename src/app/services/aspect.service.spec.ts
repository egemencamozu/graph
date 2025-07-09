import { TestBed } from '@angular/core/testing';

import { AspectService } from './aspect.service';

describe('AspectService', () => {
  let service: AspectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AspectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
