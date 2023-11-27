rm -r build
npx tstl
cd build; find . | grep "\.lua" > Manifest.txt; cd ..