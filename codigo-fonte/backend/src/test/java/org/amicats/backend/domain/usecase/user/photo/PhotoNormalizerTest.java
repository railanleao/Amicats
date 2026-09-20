package org.amicats.backend.domain.usecase.user.photo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import javax.imageio.ImageIO;
import org.amicats.backend.exception.InvalidPhotoException;
import org.junit.jupiter.api.Test;

class PhotoNormalizerTest {

  @Test
  void cropsToASquareAndShrinksLargeImagesToTheMaximumSide() throws IOException {
    byte[] result = PhotoNormalizer.normalize(image(1000, 600, BufferedImage.TYPE_INT_RGB, "png"));

    BufferedImage output = ImageIO.read(new ByteArrayInputStream(result));
    assertThat(output.getWidth()).isEqualTo(512);
    assertThat(output.getHeight()).isEqualTo(512);
  }

  @Test
  void doesNotUpscaleSmallImages() throws IOException {
    byte[] result = PhotoNormalizer.normalize(image(100, 80, BufferedImage.TYPE_INT_RGB, "jpg"));

    BufferedImage output = ImageIO.read(new ByteArrayInputStream(result));
    assertThat(output.getWidth()).isEqualTo(80);
    assertThat(output.getHeight()).isEqualTo(80);
  }

  @Test
  void alwaysOutputsJpeg() {
    byte[] result = PhotoNormalizer.normalize(image(200, 200, BufferedImage.TYPE_INT_ARGB, "png"));

    assertThat(result[0]).isEqualTo((byte) 0xFF);
    assertThat(result[1]).isEqualTo((byte) 0xD8);
  }

  @Test
  void flattensTransparencyOntoAWhiteBackground() throws IOException {
    byte[] result = PhotoNormalizer.normalize(image(200, 200, BufferedImage.TYPE_INT_ARGB, "png"));

    BufferedImage output = ImageIO.read(new ByteArrayInputStream(result));
    Color corner = new Color(output.getRGB(0, 0));
    assertThat(corner.getRed()).isGreaterThan(240);
    assertThat(corner.getGreen()).isGreaterThan(240);
    assertThat(corner.getBlue()).isGreaterThan(240);
  }

  @Test
  void rejectsFilesThatAreNotImages() {
    byte[] text = "isto não é uma imagem".getBytes(StandardCharsets.UTF_8);

    assertThatThrownBy(() -> PhotoNormalizer.normalize(text))
        .isInstanceOf(InvalidPhotoException.class);
  }

  @Test
  void rejectsImageFormatsOtherThanJpegAndPng() {
    byte[] gif = image(50, 50, BufferedImage.TYPE_INT_RGB, "gif");

    assertThatThrownBy(() -> PhotoNormalizer.normalize(gif))
        .isInstanceOf(InvalidPhotoException.class);
  }

  @Test
  void rejectsEmptyContentAndFilesOverTheSizeLimit() {
    assertThatThrownBy(() -> PhotoNormalizer.normalize(new byte[0]))
        .isInstanceOf(InvalidPhotoException.class);
    assertThatThrownBy(() -> PhotoNormalizer.normalize(new byte[PhotoNormalizer.MAX_BYTES + 1]))
        .isInstanceOf(InvalidPhotoException.class);
  }

  @Test
  void rejectsImagesWithTooManyPixels() {
    byte[] huge = image(5000, 5000, BufferedImage.TYPE_BYTE_GRAY, "png");

    assertThatThrownBy(() -> PhotoNormalizer.normalize(huge))
        .isInstanceOf(InvalidPhotoException.class);
  }

  private static byte[] image(int width, int height, int type, String format) {
    try {
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      ImageIO.write(new BufferedImage(width, height, type), format, out);
      return out.toByteArray();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
