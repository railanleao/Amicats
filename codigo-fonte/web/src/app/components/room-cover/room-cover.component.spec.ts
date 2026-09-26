import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RoomService } from '../../services/resources/room.service';
import { RoomCoverComponent } from './room-cover.component';

describe('RoomCoverComponent', () => {
  let fixture: ComponentFixture<RoomCoverComponent>;
  let roomServiceSpy: jasmine.SpyObj<RoomService>;
  let createObjectUrl: jasmine.Spy;
  let revokeObjectUrl: jasmine.Spy;

  function setInputs(inputs: Record<string, unknown>): void {
    Object.entries(inputs).forEach(([key, value]) =>
      fixture.componentRef.setInput(key, value),
    );
    fixture.detectChanges();
  }

  beforeEach(async () => {
    roomServiceSpy = jasmine.createSpyObj<RoomService>('RoomService', [
      'photo',
    ]);
    createObjectUrl = spyOn(URL, 'createObjectURL').and.returnValues(
      'blob:photo-1',
      'blob:photo-2',
    );
    revokeObjectUrl = spyOn(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [RoomCoverComponent],
      providers: [{ provide: RoomService, useValue: roomServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomCoverComponent);
  });

  it('shows nothing when there is no photo and never requests one', () => {
    setInputs({ roomId: 7, hasPhoto: false });

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(roomServiceSpy.photo).not.toHaveBeenCalled();
  });

  it('requests the photo and shows it as an image', () => {
    roomServiceSpy.photo.and.returnValue(of(new Blob(['x'])));

    setInputs({ roomId: 7, hasPhoto: true });

    expect(roomServiceSpy.photo).toHaveBeenCalledWith(7);
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('blob:photo-1');
  });

  it('reloads the photo when the version changes and releases the previous one', () => {
    roomServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({ roomId: 7, hasPhoto: true, version: 0 });

    setInputs({ version: 1 });

    expect(roomServiceSpy.photo).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      'blob:photo-2',
    );
  });

  it('falls back to nothing when the photo cannot be loaded', () => {
    roomServiceSpy.photo.and.returnValue(
      throwError(() => new Error('not found')),
    );

    setInputs({ roomId: 7, hasPhoto: true });

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('releases the image URL when destroyed', () => {
    roomServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({ roomId: 7, hasPhoto: true });

    fixture.destroy();

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
  });

  it('shows the preview instead of requesting a photo when a preview is given', () => {
    setInputs({ previewUrl: 'blob:preview' });

    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      'blob:preview',
    );
    expect(roomServiceSpy.photo).not.toHaveBeenCalled();
  });
});
