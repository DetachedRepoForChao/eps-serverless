import { TestBed } from '@angular/core/testing';

import { GiftPointsService } from './gift-points.service';

describe('GiftPointsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GiftPointsService = TestBed.get(GiftPointsService);
    expect(service).toBeTruthy();
  });
});
