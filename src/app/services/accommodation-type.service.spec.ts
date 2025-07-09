import { TestBed } from '@angular/core/testing';

import { AccommodationTypeService } from './accommodation-type.service';

describe('AccommodationTypeService', () => {
  let service: AccommodationTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccommodationTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
