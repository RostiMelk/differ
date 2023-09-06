export const snapshotQuery = `*[_id == $id][0]{
    ...,
    before {
      ...,
      image {
        asset->
      }
    },
    after {
      ...,
      image {
        asset->
      }
    }
}`;

export const snapshotQueryLite = `*[_id == $id][0]{
  visualDiff,
  metadataDiff,
  bodyDiff,
}`;
