package org.amicats.backend.domain.interfaces.storage;

import java.util.Optional;

public interface PhotoStorage {

  void save(String key, byte[] content);

  Optional<byte[]> load(String key);

  void delete(String key);
}
