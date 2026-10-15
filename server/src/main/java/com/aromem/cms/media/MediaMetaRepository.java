package com.aromem.cms.media;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MediaMetaRepository extends JpaRepository<MediaMeta, Long> {

    Optional<MediaMeta> findByFileId(String fileId);

    /** 去重用：同一份内容只保留一个 fileId，不重复占用磁盘。 */
    Optional<MediaMeta> findFirstByMd5(String md5);

    boolean existsByFileId(String fileId);
}
