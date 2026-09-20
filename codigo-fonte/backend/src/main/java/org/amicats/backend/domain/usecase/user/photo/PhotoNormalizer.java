package org.amicats.backend.domain.usecase.user.photo;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.amicats.backend.exception.InvalidPhotoException;

public final class PhotoNormalizer {

  public static final int MAX_BYTES = 5 * 1024 * 1024;

  private static final long MAX_SOURCE_PIXELS = 16_000_000L;
  private static final int MAX_SIDE = 512;
  private static final Set<String> ALLOWED_FORMATS = Set.of("jpeg", "png");

  private PhotoNormalizer() {}

  public static byte[] normalize(byte[] content) {
    if (content == null || content.length == 0) {
      throw new InvalidPhotoException("O arquivo está vazio.");
    }
    if (content.length > MAX_BYTES) {
      throw new InvalidPhotoException("A foto deve ter no máximo 5 MB.");
    }

    try (ImageInputStream input =
        ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
      Iterator<ImageReader> readers = input == null ? null : ImageIO.getImageReaders(input);
      if (readers == null || !readers.hasNext()) {
        throw new InvalidPhotoException("Envie uma imagem JPG ou PNG.");
      }

      ImageReader reader = readers.next();
      try {
        String format = reader.getFormatName().toLowerCase(Locale.ROOT);
        if (!ALLOWED_FORMATS.contains(format)) {
          throw new InvalidPhotoException("Envie uma imagem JPG ou PNG.");
        }

        reader.setInput(input, true, true);
        if ((long) reader.getWidth(0) * reader.getHeight(0) > MAX_SOURCE_PIXELS) {
          throw new InvalidPhotoException("A imagem tem dimensões grandes demais.");
        }

        return toSquareJpeg(reader.read(0));
      } finally {
        reader.dispose();
      }
    } catch (InvalidPhotoException e) {
      throw e;
    } catch (IOException | RuntimeException e) {
      throw new InvalidPhotoException("Não foi possível ler a imagem.");
    }
  }

  private static byte[] toSquareJpeg(BufferedImage source) throws IOException {
    int width = source.getWidth();
    int height = source.getHeight();
    int side = Math.min(width, height);
    BufferedImage square = source.getSubimage((width - side) / 2, (height - side) / 2, side, side);

    int target = Math.min(side, MAX_SIDE);
    BufferedImage output = new BufferedImage(target, target, BufferedImage.TYPE_INT_RGB);
    Graphics2D graphics = output.createGraphics();
    try {
      graphics.setColor(Color.WHITE);
      graphics.fillRect(0, 0, target, target);
      graphics.setRenderingHint(
          RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
      graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
      graphics.drawImage(square, 0, 0, target, target, null);
    } finally {
      graphics.dispose();
    }

    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
    if (!ImageIO.write(output, "jpg", bytes)) {
      throw new IOException("Nenhum gravador de JPEG disponível.");
    }
    return bytes.toByteArray();
  }
}
