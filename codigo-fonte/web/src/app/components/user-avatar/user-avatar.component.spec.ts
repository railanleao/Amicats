import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UserService } from '../../services/resources/user.service';
import { UserAvatarComponent } from './user-avatar.component';

describe('UserAvatarComponent', () => {
  let fixture: ComponentFixture<UserAvatarComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let createObjectUrl: jasmine.Spy;
  let revokeObjectUrl: jasmine.Spy;

  function setInputs(inputs: Record<string, unknown>): void {
    Object.entries(inputs).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['photo']);
    createObjectUrl = spyOn(URL, 'createObjectURL').and.returnValues('blob:photo-1', 'blob:photo-2');
    revokeObjectUrl = spyOn(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [UserAvatarComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarComponent);
  });

  it('shows the initials when there is no photo and never requests one', () => {
    setInputs({ name: 'Marina Alves', userId: 7, hasPhoto: false });

    expect(fixture.nativeElement.textContent.trim()).toBe('MA');
    expect(userServiceSpy.photo).not.toHaveBeenCalled();
  });

  it('uses a single initial for a single name and a question mark for an empty one', () => {
    setInputs({ name: 'Marina' });
    expect(fixture.nativeElement.textContent.trim()).toBe('M');

    setInputs({ name: '   ' });
    expect(fixture.nativeElement.textContent.trim()).toBe('?');
  });

  it('requests the photo and shows it as an image', () => {
    userServiceSpy.photo.and.returnValue(of(new Blob(['x'])));

    setInputs({ name: 'Marina Alves', userId: 7, hasPhoto: true });

    expect(userServiceSpy.photo).toHaveBeenCalledWith(7);
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe('blob:photo-1');
  });

  it('reloads the photo when the version changes and releases the previous one', () => {
    userServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({ name: 'Marina Alves', userId: 7, hasPhoto: true, version: 0 });

    setInputs({ version: 1 });

    expect(userServiceSpy.photo).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:photo-2');
  });

  it('does not reload the photo when only the name changes', () => {
    userServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({ name: 'Marina', userId: 7, hasPhoto: true });

    setInputs({ name: 'Marina Alves' });

    expect(userServiceSpy.photo).toHaveBeenCalledTimes(1);
  });

  it('falls back to the initials when the photo cannot be loaded', () => {
    userServiceSpy.photo.and.returnValue(throwError(() => new Error('not found')));

    setInputs({ name: 'Marina Alves', userId: 7, hasPhoto: true });

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('MA');
  });

  it('releases the image URL when destroyed', () => {
    userServiceSpy.photo.and.returnValue(of(new Blob(['x'])));
    setInputs({ name: 'Marina Alves', userId: 7, hasPhoto: true });

    fixture.destroy();

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:photo-1');
  });

  it('shows the preview instead of requesting a photo when a preview is given', () => {
    setInputs({ name: 'Marina Alves', previewUrl: 'blob:preview' });

    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('blob:preview');
    expect(userServiceSpy.photo).not.toHaveBeenCalled();
  });
});
